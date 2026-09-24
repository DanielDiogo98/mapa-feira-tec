"""Gera o catálogo público do mapa a partir do dump do banco da feira.

O arquivo de origem nunca é copiado para o projeto. Somente os campos públicos
necessários para busca e rota são gravados em lib/projects-data.json.
"""

import argparse
import json
import re
from collections import defaultdict
from pathlib import Path


def decode_mysql_string(value: str) -> str:
    result = []
    escaped = False
    escapes = {"0": "\0", "b": "\b", "n": "\n", "r": "\r", "t": "\t", "Z": "\x1a"}
    for character in value:
        if escaped:
            result.append(escapes.get(character, character))
            escaped = False
        elif character == "\\":
            escaped = True
        else:
            result.append(character)
    return "".join(result)


def parse_value(token: str):
    token = token.strip()
    if token.upper() == "NULL":
        return None
    if token.startswith("'") and token.endswith("'"):
        return decode_mysql_string(token[1:-1])
    try:
        return int(token)
    except ValueError:
        return token


def parse_tuples(text: str):
    rows, row, token = [], [], []
    in_string = escaped = False
    depth = index = 0
    while index < len(text):
        character = text[index]
        if in_string:
            token.append(character)
            if escaped:
                escaped = False
            elif character == "\\":
                escaped = True
            elif character == "'":
                if index + 1 < len(text) and text[index + 1] == "'":
                    token.append("'")
                    index += 1
                else:
                    in_string = False
        elif character == "'":
            in_string = True
            token.append(character)
        elif character == "(":
            if depth == 0:
                row, token = [], []
            else:
                token.append(character)
            depth += 1
        elif character == ")":
            depth -= 1
            if depth == 0:
                row.append(parse_value("".join(token)))
                rows.append(row)
                token = []
            else:
                token.append(character)
        elif character == "," and depth == 1:
            row.append(parse_value("".join(token)))
            token = []
        elif depth > 0:
            token.append(character)
        index += 1
    return rows


def extract_table(sql: str, table: str):
    pattern = re.compile(
        rf"INSERT INTO `{re.escape(table)}`\s*\((.*?)\)\s*VALUES\s*(.*?);",
        re.S,
    )
    records = []
    for match in pattern.finditer(sql):
        columns = [column.strip().strip("`") for column in match.group(1).split(",")]
        for row in parse_tuples(match.group(2)):
            if len(row) == len(columns):
                records.append(dict(zip(columns, row)))
    return records


def turma_key(value) -> str:
    return (
        str(value or "")
        .strip()
        .upper()
        .replace("º", "")
        .replace("°", "")
        .replace(" ", "")
    )


def turma_label(value: str) -> str:
    match = re.fullmatch(r"(\d+)([A-Z]+)", value)
    return f"{match.group(1)}º{match.group(2)}" if match else value


def ods_items(value) -> list[dict]:
    items = []
    for part in str(value or "").split("|"):
        match = re.match(r"\s*(\d+)\s*[·-]\s*(.+?)\s*$", part)
        if match:
            items.append({"number": int(match.group(1)), "name": match.group(2)})
    return items


def shift_label(value) -> str:
    normalized = str(value or "").strip().lower()
    return {"matutino": "Manhã", "vespertino": "Tarde", "noturno": "Noite"}.get(
        normalized, str(value or "").strip()
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("dump", type=Path)
    parser.add_argument("--output", type=Path, default=Path("lib/projects-data.json"))
    parser.add_argument("--locations", type=Path, default=Path("lib/turma-locations.json"))
    args = parser.parse_args()

    sql = args.dump.read_bytes().decode("utf-8", errors="replace")
    students = extract_table(sql, "aluno")
    projects = extract_table(sql, "projeto")
    links = extract_table(sql, "aluno_projeto")
    locations = json.loads(args.locations.read_text(encoding="utf-8"))

    students_by_id = {int(student["id"]): student for student in students}
    members_by_project = defaultdict(list)
    for link in links:
        student = students_by_id.get(int(link["id_aluno"]))
        if student:
            members_by_project[int(link["id_projeto"])].append(student)

    catalog = []
    for project in projects:
        project_id = int(project["id"])
        project_name = str(project.get("nome") or "").strip()
        if re.match(r"^teste(?:\b|\d)", project_name, re.I):
            continue
        members = members_by_project[project_id][:]
        leader = students_by_id.get(int(project["id_aluno"])) if project.get("id_aluno") else None
        if leader and all(int(item["id"]) != int(leader["id"]) for item in members):
            members.append(leader)
        turmas = sorted({turma_key(item.get("turma")) for item in members if item.get("turma")})
        courses = sorted({str(item.get("curso") or "").strip() for item in members if item.get("curso")})
        item = {
            "id": project_id,
            "name": project_name,
            "description": str(project.get("descricao") or "").strip(),
            "shift": shift_label(project.get("periodo")),
            "courses": courses,
            "series": [turma_label(turma) for turma in turmas],
            "students": sorted({str(member.get("nome") or "").strip() for member in members if member.get("nome")}),
            "ods": ods_items(project.get("ods")),
        }
        mapped = {json.dumps(locations[turma], sort_keys=True) for turma in turmas if turma in locations}
        if len(mapped) == 1:
            item["location"] = json.loads(mapped.pop())
        catalog.append(item)

    catalog.sort(key=lambda item: item["name"].casefold())
    args.output.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    located = sum(1 for item in catalog if "location" in item)
    print(f"Catálogo público: {len(catalog)} projetos; {located} com rota; {len(catalog) - located} aguardando turma/local.")


if __name__ == "__main__":
    main()
