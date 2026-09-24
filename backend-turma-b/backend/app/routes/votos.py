from datetime import datetime

from fastapi import APIRouter, Cookie, HTTPException, Request

from app.database.connection import execute_query
from app.database.queries.votacao_queries import SELECT_PERIODO_ATUAL
from app.database.queries.voto_queries import SELECT_VOTO_ATIVO_POR_VISITANTE
from app.schemas.voto import VotoAtual, VotoPayload, VotoResposta
from app.services.votacao_service import is_voting_open
from app.services.voto_service import atualizar_voto, get_voto_ativo_do_visitante, registrar_voto, remover_voto

router = APIRouter(prefix="/votos", tags=["votos"])


@router.get("/meu-voto", response_model=VotoResposta, summary="Retorna o voto ativo do visitante atual.")
def meu_voto(visitante_id: int = Cookie(None, alias="visitante_id")):
    if visitante_id is None or visitante_id <= 0:
        raise HTTPException(status_code=401, detail="Visitante não identificado.")

    try:
        voto = get_voto_ativo_do_visitante(visitante_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Não foi possível consultar o voto no banco: {exc}") from exc

    if not voto:
        raise HTTPException(status_code=404, detail="Nenhum voto ativo encontrado para este visitante.")

    return {"message": "Voto ativo encontrado.", "voto": voto}


@router.put("", response_model=VotoResposta, summary="Cria ou atualiza o voto ativo do visitante.")
def salvar_voto(payload: VotoPayload, request: Request, visitante_id: int = Cookie(None, alias="visitante_id")):
    if visitante_id is None or visitante_id <= 0:
        raise HTTPException(status_code=401, detail="Visitante não identificado.")

    try:
        periodo = execute_query(SELECT_PERIODO_ATUAL, fetch="one")
        if not periodo:
            raise HTTPException(status_code=409, detail="Nenhum período de votação configurado.")

        if not is_voting_open():
            raise HTTPException(status_code=409, detail="A votação está fechada e não aceita novos votos.")

        if payload.id_projeto <= 0:
            raise HTTPException(status_code=422, detail="O id_projeto deve ser maior que zero.")

        try:
            voto = atualizar_voto(visitante_id, payload.id_projeto, periodo["id_periodo"])
            return {"message": "Voto registrado com sucesso.", "voto": voto}
        except PermissionError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc
        except ValueError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Não foi possível processar a votação no banco: {exc}") from exc


@router.delete("", summary="Desativa o voto ativo do visitante atual.")
def remover_voto_atual(visitante_id: int = Cookie(None, alias="visitante_id")):
    if visitante_id is None or visitante_id <= 0:
        raise HTTPException(status_code=401, detail="Visitante não identificado.")

    try:
        periodo = execute_query(SELECT_PERIODO_ATUAL, fetch="one")
        if not periodo:
            raise HTTPException(status_code=409, detail="Nenhum período de votação configurado.")

        if not is_voting_open():
            raise HTTPException(status_code=409, detail="A votação está fechada e não pode remover votos ativos.")

        try:
            resultado = remover_voto(visitante_id)
            return resultado
        except ValueError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        except PermissionError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Não foi possível remover o voto no banco: {exc}") from exc
