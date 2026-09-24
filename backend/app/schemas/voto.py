from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class VotoPayload(BaseModel):
    id_projeto: int = Field(..., gt=0)


class VotoAtual(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_curtida: int
    id_projeto: int
    id_visitante: int
    id_periodo: int
    data_curtida: datetime
    ativa: bool
    nome_projeto: str | None = None


class VotoResposta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    message: str
    voto: VotoAtual | None = None
