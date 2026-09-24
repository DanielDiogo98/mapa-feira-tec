SELECT_VOTO_ATIVO_POR_VISITANTE = """
    SELECT c.id_curtida, c.ativa, c.data_curtida, c.id_visitante, c.id_projeto, c.id_periodo,
           p.id_projeto, p.nome_projeto, p.turno, p.descricao
    FROM curtidas c
    INNER JOIN projetos p ON p.id_projeto = c.id_projeto
    WHERE c.id_visitante = %s AND c.ativa = 1
    ORDER BY c.data_curtida DESC
    LIMIT 1
"""

SELECT_VOTOS_ATIVOS_POR_VISITANTE = """
    SELECT c.id_curtida, c.ativa, c.data_curtida, c.id_visitante, c.id_projeto, c.id_periodo
    FROM curtidas c
    WHERE c.id_visitante = %s AND c.ativa = 1
    ORDER BY c.data_curtida DESC
"""

INSERT_CURTIDA = """
    INSERT INTO curtidas (ativa, data_curtida, id_visitante, id_projeto, id_periodo)
    VALUES (%s, %s, %s, %s, %s)
"""

UPDATE_CURTIDA = """
    UPDATE curtidas
    SET id_projeto = %s,
        data_curtida = %s,
        id_periodo = %s
    WHERE id_curtida = %s AND ativa = 1
"""

DESATIVAR_VOTO = """
    UPDATE curtidas
    SET ativa = 0
    WHERE id_curtida = %s AND ativa = 1
"""

SELECT_PROJETO_BY_ID = """
    SELECT id_projeto, turno, nome_projeto, descricao
    FROM projetos
    WHERE id_projeto = %s
    LIMIT 1
"""

SELECT_RANKING_ATIVO = """
    SELECT p.id_projeto, p.nome_projeto, p.turno, p.descricao,
           COUNT(c.id_curtida) AS quantidade_curtidas
    FROM projetos p
    LEFT JOIN curtidas c ON c.id_projeto = p.id_projeto AND c.ativa = 1
    GROUP BY p.id_projeto, p.nome_projeto, p.turno, p.descricao
    ORDER BY quantidade_curtidas DESC, p.id_projeto ASC
"""

SELECT_VOTOS_ATIVOS_POR_PROJETO = """
    SELECT COUNT(*) AS quantidade
    FROM curtidas
    WHERE id_projeto = %s AND ativa = 1
"""

SELECT_VOTO_ATIVO_POR_ID = """
    SELECT id_curtida, ativa, data_curtida, id_visitante, id_projeto, id_periodo
    FROM curtidas
    WHERE id_curtida = %s AND ativa = 1
    LIMIT 1
"""
