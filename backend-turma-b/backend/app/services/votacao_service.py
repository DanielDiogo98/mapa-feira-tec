from datetime import datetime

from app.database.connection import execute_query, execute_write
from app.database.queries.votacao_queries import (
    INSERT_PERIODO,
    SELECT_PERIODO_ATUAL,
    SELECT_PERIODO_BY_ID,
    SELECT_PERIODO_EM_ABERTO,
    UPDATE_PERIODO,
)


def get_periodo_atual():
    return execute_query(SELECT_PERIODO_ATUAL, fetch="one")


def get_periodo_aberto():
    return execute_query(SELECT_PERIODO_EM_ABERTO, fetch="one")


def is_voting_open(now: datetime | None = None):
    periodo = get_periodo_aberto()
    if not periodo:
        return False
    current = now or datetime.now()
    return periodo["data_inicio"] <= current <= periodo["data_encerramento"] and bool(periodo["andamento"])


def ensure_periodo_config_valid(data_inicio: datetime, data_encerramento: datetime):
    if data_inicio >= data_encerramento:
        raise ValueError("A data de início deve ser anterior à data de encerramento.")


def create_periodo(data_inicio: datetime, data_encerramento: datetime, andamento: bool = True):
    ensure_periodo_config_valid(data_inicio, data_encerramento)
    execute_write(INSERT_PERIODO, (data_inicio, data_encerramento, int(andamento)))
    return get_periodo_atual()


def update_periodo(id_periodo: int, data_inicio: datetime, data_encerramento: datetime, andamento: bool):
    periodo = execute_query(SELECT_PERIODO_BY_ID, (id_periodo,), fetch="one")
    if not periodo:
        raise ValueError("Período de votação não encontrado.")
    ensure_periodo_config_valid(data_inicio, data_encerramento)
    execute_write(UPDATE_PERIODO, (data_inicio, data_encerramento, int(andamento), id_periodo))
    return execute_query(SELECT_PERIODO_BY_ID, (id_periodo,), fetch="one")


def get_status_payload():
    periodo = get_periodo_atual()
    if not periodo:
        return {
            "aberto": False,
            "periodo_atual": None,
            "message": "Nenhum período de votação configurado.",
        }
    aberto = is_voting_open()
    return {
        "aberto": aberto,
        "periodo_atual": periodo,
        "message": "Votação aberta." if aberto else "Votação fechada.",
    }
