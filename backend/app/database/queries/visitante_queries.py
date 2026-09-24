SELECT_VISITANTE_BY_ID = """
    SELECT id_visitante, ip, modelo_dispositivo
    FROM visitante
    WHERE id_visitante = %s
    LIMIT 1
"""

INSERT_VISITANTE = """
    INSERT INTO visitante (ip, modelo_dispositivo)
    VALUES (%s, %s)
"""

SELECT_VISITANTE_BY_IP_AND_DEVICE = """
    SELECT id_visitante, ip, modelo_dispositivo
    FROM visitante
    WHERE ip = %s AND modelo_dispositivo = %s
    ORDER BY id_visitante DESC
    LIMIT 1
"""
