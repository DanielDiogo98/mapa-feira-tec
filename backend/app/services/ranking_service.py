from app.database.connection import execute_query
from app.database.queries.projeto_queries import SELECT_ALL_PROJETOS
from app.database.queries.voto_queries import SELECT_RANKING_ATIVO


def get_ranking():
    ranking = execute_query(SELECT_RANKING_ATIVO, fetch="all")
    if ranking:
        return ranking

    projetos = execute_query(SELECT_ALL_PROJETOS, fetch="all")
    return [
        {
            "id_projeto": projeto["id_projeto"],
            "nome_projeto": projeto["nome_projeto"],
            "turno": projeto["turno"],
            "descricao": projeto["descricao"],
            "quantidade_curtidas": 0,
        }
        for projeto in projetos
    ]


def get_podio():
    ranking = get_ranking()
    podio = []
    for posicao, item in enumerate(ranking[:3], start=1):
        podio.append({
            "posicao": posicao,
            "id_projeto": item["id_projeto"],
            "nome_projeto": item["nome_projeto"],
            "quantidade_curtidas": item["quantidade_curtidas"],
        })
    return podio


def get_resultado_final():
    from app.database.queries.resultado_queries import SELECT_RESULTADO_FINAL
    resultados = execute_query(SELECT_RESULTADO_FINAL, fetch="all")
    return resultados
