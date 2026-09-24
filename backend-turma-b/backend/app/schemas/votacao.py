from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PeriodoVotacao(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_periodo: int
    data_inicio: datetime
    data_encerramento: datetime
    andamento: bool


class AtualizarPeriodoPayload(BaseModel):
    data_inicio: datetime
    data_encerramento: datetime
    andamento: bool = Field(default=True)


class PeriodoStatusResposta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    aberto: bool
    periodo_atual: PeriodoVotacao | None = None
    message: str
