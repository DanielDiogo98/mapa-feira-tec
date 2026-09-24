import secrets

from fastapi import Header, HTTPException

from app.config import settings


def require_admin_token(x_admin_token: str | None = Header(default=None)):
    if not settings.ADMIN_TOKEN:
        raise HTTPException(status_code=503, detail="Acesso administrativo ainda não configurado.")

    if not x_admin_token or not secrets.compare_digest(x_admin_token, settings.ADMIN_TOKEN):
        raise HTTPException(status_code=401, detail="Credencial administrativa inválida.")
