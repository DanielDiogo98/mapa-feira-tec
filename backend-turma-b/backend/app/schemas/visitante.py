from pydantic import BaseModel, ConfigDict, Field


class VisitanteIdentificado(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_visitante: int
    ip: str
    modelo_dispositivo: str


class VisitanteResposta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    message: str
    visitante: VisitanteIdentificado
    cookie_name: str = "visitante_id"
