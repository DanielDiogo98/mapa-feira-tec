from fastapi import APIRouter, Cookie, HTTPException, Request
from fastapi.responses import JSONResponse

from app.schemas.visitante import VisitanteResposta
from app.services.visitante_service import COOKIE_NAME, find_or_create_visitante, generate_visitor_identifier, get_visitor_by_id

router = APIRouter(prefix="/visitantes", tags=["visitantes"])


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
                response.set_cookie(key=COOKIE_NAME, value=str(visitante["id_visitante"]), httponly=True, samesite="lax")
                return response

        ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent")
        visitante = find_or_create_visitante(ip, user_agent)
        response = JSONResponse(
            content={
                "message": "Visitante identificado com sucesso.",
                "visitante": visitante,
                "cookie_name": COOKIE_NAME,
            }
        )
        response.set_cookie(key=COOKIE_NAME, value=str(visitante["id_visitante"]), httponly=True, samesite="lax")
        return response
    except Exception:
        response = JSONResponse(
            content={
                "message": "Banco de dados indisponível no momento; visitante não foi persistido.",
                "visitante": {
                    "id_visitante": 0,
                    "ip": (request.client.host if request.client else "unknown"),
                    "modelo_dispositivo": request.headers.get("user-agent", "desconhecido")[:50],
                },
                "cookie_name": COOKIE_NAME,
            }
        )
        response.set_cookie(key=COOKIE_NAME, value="0", httponly=True, samesite="lax")
        return response
