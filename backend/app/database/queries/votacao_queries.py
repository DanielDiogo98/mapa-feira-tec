SELECT_PERIODO_ATUAL = """
    SELECT id_periodo, data_inicio, data_encerramento, andamento
    FROM periodo_votacao
    ORDER BY id_periodo DESC
    LIMIT 1
"""

INSERT_PERIODO = """
    INSERT INTO periodo_votacao (data_inicio, data_encerramento, andamento)
    VALUES (%s, %s, %s)
"""

UPDATE_PERIODO = """
    UPDATE periodo_votacao
    SET data_inicio = %s,
        data_encerramento = %s,
        andamento = %s
    WHERE id_periodo = %s
"""

SELECT_PERIODO_BY_ID = """
    SELECT id_periodo, data_inicio, data_encerramento, andamento
    FROM periodo_votacao
    WHERE id_periodo = %s
    LIMIT 1
"""

SELECT_PERIODO_EM_ABERTO = """
    SELECT id_periodo, data_inicio, data_encerramento, andamento
    FROM periodo_votacao
    WHERE andamento = 1
    ORDER BY id_periodo DESC
    LIMIT 1
"""
