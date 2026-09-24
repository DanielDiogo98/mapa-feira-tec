from fastapi import APIRouter

from app.services.ranking_service import get_podio, get_ranking, get_resultado_final

router = APIRouter(prefix="/ranking", tags=["ranking"])


@router.get("", summary="Calcula o ranking atual com base nos votos ativos.")
def ranking_atual():
    return {"ranking": get_ranking()}


@router.get("/podio", summary="Retorna o pódio dos projetos com mais votos.")
def podio():
    return {"podio": get_podio()}


@router.get("/resultado-final", summary="Retorna o resultado final salvo na tabela resultado.")
def resultado_final():
    return {"resultado_final": get_resultado_final()}
