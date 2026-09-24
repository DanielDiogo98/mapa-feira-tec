from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes.ranking import router as ranking_router
from app.routes.votacao import router as votacao_router
from app.routes.visitantes import router as visitantes_router
from app.routes.votos import router as votos_router

app = FastAPI(
    title="Feira Tecnológica - Backend de Votação",
    version="1.0.0",
    description="Backend para o sistema de votação da Feira Tecnológica, conectado diretamente ao MariaDB com SQL puro.",
    root_path=settings.API_ROOT_PATH,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(visitantes_router)
app.include_router(votos_router)
app.include_router(votacao_router)
app.include_router(ranking_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
