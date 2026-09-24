from fastapi import APIRouter, Cookie, HTTPException, Request
from fastapi.responses import JSONResponse

from app.schemas.visitante import VisitanteResposta
from app.config import settings
from app.services.visitante_service import COOKIE_NAME, find_or_create_visitante, get_visitor_by_id

router = APIRouter(prefix="/visitantes", tags=["visitantes"])


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",", 1)[0].strip()
    return request.client.host if request.client else "unknown"


def _set_visitor_cookie(response: JSONResponse, visitante_id: int):
    response.set_cookie(
        key=COOKIE_NAME,
        value=str(visitante_id),
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
    )


@router.post(
    "/identificar",
    response_model=VisitanteResposta,
    summary="Identifica o visitante e registra o cookie no navegador.",
    description="Verifica o cookie de visitante; se não existir, cria um visitante e o persiste com base no IP e no modelo do dispositivo.",
)
def identificar_visitante(request: Request):
    try:
        visitante_id_cookie = request.cookies.get(COOKIE_NAME)
        if visitante_id_cookie:
            visitante = get_visitor_by_id(int(visitante_id_cookie))
            if visitante:
                response = JSONResponse(
                    content={
                        "message": "Visitante já identificado.",
                        "visitante": visitante,
                        "cookie_name": COOKIE_NAME,
                    }
                )
                _set_visitor_cookie(response, visitante["id_visitante"])
                return response

        ip = _client_ip(request)
        user_agent = request.headers.get("user-agent")
        visitante = find_or_create_visitante(ip, user_agent)
        response = JSONResponse(
            content={
                "message": "Visitante identificado com sucesso.",
                "visitante": visitante,
                "cookie_name": COOKIE_NAME,
            }
        )
        _set_visitor_cookie(response, visitante["id_visitante"])
        return response
    except Exception:
        response = JSONResponse(
            content={
                "message": "Banco de dados indisponível no momento; visitante não foi persistido.",
                "visitante": {
                    "id_visitante": 0,
                    "ip": _client_ip(request),
                    "modelo_dispositivo": request.headers.get("user-agent", "desconhecido")[:50],
                },
                "cookie_name": COOKIE_NAME,
            }
        )
        _set_visitor_cookie(response, 0)
        return response
