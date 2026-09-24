from datetime import datetime

from app.database.connection import execute_query, execute_write
from app.database.queries.voto_queries import (
    DESATIVAR_VOTO,
    INSERT_CURTIDA,
    SELECT_PROJETO_BY_ID,
    SELECT_VOTO_ATIVO_POR_VISITANTE,
    SELECT_VOTOS_ATIVOS_POR_VISITANTE,
    UPDATE_CURTIDA,
)
from app.services.votacao_service import is_voting_open


def get_projeto_by_id(projeto_id: int):
    return execute_query(SELECT_PROJETO_BY_ID, (projeto_id,), fetch="one")


def get_voto_ativo_do_visitante(id_visitante: int):
    return execute_query(SELECT_VOTO_ATIVO_POR_VISITANTE, (id_visitante,), fetch="one")


def get_votos_ativos_do_visitante(id_visitante: int):
    return execute_query(SELECT_VOTOS_ATIVOS_POR_VISITANTE, (id_visitante,), fetch="all")


def registrar_voto(id_visitante: int, id_projeto: int, id_periodo: int):
    projeto = get_projeto_by_id(id_projeto)
    if not projeto:
        raise ValueError("Projeto informado não existe.")

    if not is_voting_open():
        raise PermissionError("A votação está fechada para novas curtidas.")

    votos_ativos = get_votos_ativos_do_visitante(id_visitante)
    if votos_ativos:
        for voto in votos_ativos:
            execute_write(DESATIVAR_VOTO, (voto["id_curtida"],))

    execute_write(
        INSERT_CURTIDA,
        (1, datetime.now(), id_visitante, id_projeto, id_periodo),
    )
    return get_voto_ativo_do_visitante(id_visitante)


def atualizar_voto(id_visitante: int, id_projeto: int, id_periodo: int):
    projeto = get_projeto_by_id(id_projeto)
    if not projeto:
        raise ValueError("Projeto informado não existe.")

    if not is_voting_open():
        raise PermissionError("A votação está fechada para troca de votos.")

    voto = get_voto_ativo_do_visitante(id_visitante)
    if not voto:
        return registrar_voto(id_visitante, id_projeto, id_periodo)

    execute_write(
        UPDATE_CURTIDA,
        (id_projeto, datetime.now(), id_periodo, voto["id_curtida"]),
    )
    return get_voto_ativo_do_visitante(id_visitante)


def remover_voto(id_visitante: int):
    if not is_voting_open():
        raise PermissionError("A votação está fechada e não pode remover votos ativos.")

    voto = get_voto_ativo_do_visitante(id_visitante)
    if not voto:
        raise ValueError("Nenhum voto ativo foi encontrado para esse visitante.")

    execute_write(DESATIVAR_VOTO, (voto["id_curtida"],))
    return {"message": "Voto removido com sucesso."}


def get_ranking_ativo():
    from app.database.connection import execute_query
    from app.database.queries.voto_queries import SELECT_RANKING_ATIVO

    rows = execute_query(SELECT_RANKING_ATIVO, fetch="all")
    if not rows:
        # Incluir projetos que tenham zero votos.
        from app.database.connection import execute_query as eq
        from app.database.queries.projeto_queries import SELECT_ALL_PROJETOS

        projetos = eq(SELECT_ALL_PROJETOS, fetch="all")
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
    return rows
