from pydantic import BaseModel, ConfigDict


class RankingItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_projeto: int
    nome_projeto: str
    turno: str | None = None
    descricao: str | None = None
    quantidade_curtidas: int


class PodioItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    posicao: int
    id_projeto: int
    nome_projeto: str
    quantidade_curtidas: int


class ResultadoFinalItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    posicao: int
    id_projeto: int
    nome_projeto: str
    quantidade_curtidas: int
    data_encerramento: str
