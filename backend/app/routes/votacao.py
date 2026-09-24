from datetime import datetime

from fastapi import APIRouter, HTTPException

from app.database.connection import execute_query, execute_write
from app.database.queries.resultado_queries import INSERT_RESULTADO, SELECT_RESULTADO_BY_PROJETO_E_DATA
from app.database.queries.votacao_queries import SELECT_PERIODO_ATUAL, SELECT_PERIODO_BY_ID
from app.database.queries.voto_queries import SELECT_RANKING_ATIVO
from app.schemas.votacao import AtualizarPeriodoPayload, PeriodoStatusResposta
from app.services.votacao_service import create_periodo, get_status_payload, update_periodo

router = APIRouter(prefix="/votacao", tags=["votacao"])


@router.get("/status", response_model=PeriodoStatusResposta, summary="Retorna o status do período e se a votação está aberta.")
def status_votacao():
    try:
        return get_status_payload()
    except Exception:
        return {
            "aberto": False,
            "periodo_atual": None,
            "message": "Banco de dados indisponível; a votação foi tratada como fechada.",
        }


@router.patch("/periodo", response_model=dict, summary="Atualiza o período de votação ou cria o primeiro período, caso ainda não exista.")
def patch_periodo(payload: AtualizarPeriodoPayload):
    periodo = execute_query(SELECT_PERIODO_ATUAL, fetch="one")
    try:
        if not periodo:
            criado = create_periodo(
                payload.data_inicio,
                payload.data_encerramento,
                payload.andamento,
            )
            return {"message": "Primeiro período de votação criado com sucesso.", "periodo": criado}

        atualizado = update_periodo(
            periodo["id_periodo"],
            payload.data_inicio,
            payload.data_encerramento,
            payload.andamento,
        )
        return {"message": "Período atualizado com sucesso.", "periodo": atualizado}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/encerrar", summary="Encerra a votação, calcula o ranking final e salva o resultado definitivo.")
def encerrar_votacao():
    periodo = execute_query(SELECT_PERIODO_ATUAL, fetch="one")
    if not periodo:
        raise HTTPException(status_code=404, detail="Nenhum período de votação encontrado.")

    ranking = execute_query(SELECT_RANKING_ATIVO, fetch="all")
    if not ranking:
        raise HTTPException(status_code=200, detail="Não há votos para calcular um resultado final.")

    ranking_ordenado = sorted(ranking, key=lambda item: (-int(item["quantidade_curtidas"]), int(item["id_projeto"])))
    try:
        for posicao, item in enumerate(ranking_ordenado, start=1):
            existe = execute_query(
                SELECT_RESULTADO_BY_PROJETO_E_DATA,
                (item["id_projeto"], periodo["data_encerramento"]),
                fetch="one",
            )
            if existe:
                continue
            execute_write(
                INSERT_RESULTADO,
                (posicao, item["quantidade_curtidas"], periodo["data_encerramento"], item["id_projeto"]),
            )

        UPDATE_SQL = """
            UPDATE periodo_votacao
            SET andamento = 0
            WHERE id_periodo = %s
        """
        execute_write(UPDATE_SQL, (periodo["id_periodo"],))
        return {"message": "Votação encerrada com sucesso.", "resultado": ranking_ordenado}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Erro ao encerrar a votação: {exc}") from exc
