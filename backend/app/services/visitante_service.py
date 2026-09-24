import secrets
from datetime import datetime

from app.database.connection import execute_query, execute_write
from app.database.queries.visitante_queries import (
    INSERT_VISITANTE,
    SELECT_VISITANTE_BY_ID,
    SELECT_VISITANTE_BY_IP_AND_DEVICE,
)

COOKIE_NAME = "visitante_id"


def normalize_ip(request_ip: str | None) -> str:
    """IP addresses can be shared and cookies may be erased, so identity is not absolute.
    This helper isolates the IP formatting logic and can be adjusted later if hashing or
    normalization is needed.
    """
    return (request_ip or "unknown").strip() or "unknown"


def build_device_model(user_agent: str | None) -> str:
    return (user_agent or "desconhecido")[:50]


def generate_visitor_identifier() -> str:
    return secrets.token_urlsafe(16)


def get_visitor_by_id(visitante_id: int):
    return execute_query(SELECT_VISITANTE_BY_ID, (visitante_id,), fetch="one")


def find_or_create_visitante(ip: str, user_agent: str | None):
    normalized_ip = normalize_ip(ip)
    modelo = build_device_model(user_agent)

    existing = execute_query(
        SELECT_VISITANTE_BY_IP_AND_DEVICE,
        (normalized_ip, modelo),
        fetch="one",
    )
    if existing:
        return existing

    new_id = execute_write(INSERT_VISITANTE, (normalized_ip, modelo))
    return get_visitor_by_id(new_id)
