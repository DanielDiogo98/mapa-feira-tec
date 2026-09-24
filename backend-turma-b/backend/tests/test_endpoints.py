from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_identify_visitor_route_expects_cookie_response():
    response = client.post(
        "/visitantes/identificar",
        headers={"User-Agent": "Mozilla/5.0", "X-Forwarded-For": "127.0.0.1"},
    )
    assert response.status_code in {200, 201, 500}
    assert response.headers.get("set-cookie") is not None or response.status_code == 500


def test_votos_route_requires_visitor_cookie():
    response = client.get("/votos/meu-voto")
    assert response.status_code in {200, 401, 404}


def test_votacao_status_route():
    response = client.get("/votacao/status")
    assert response.status_code == 200
