INSERT_RESULTADO = """
    INSERT INTO resultado (posicao, quantidade_curtidas, data_encerramento, id_projeto)
    VALUES (%s, %s, %s, %s)
"""

SELECT_RESULTADO_FINAL = """
    SELECT r.id_resultado, r.posicao, r.quantidade_curtidas, r.data_encerramento, r.id_projeto,
           p.nome_projeto, p.turno
    FROM resultado r
    INNER JOIN projetos p ON p.id_projeto = r.id_projeto
    ORDER BY r.posicao ASC, r.id_resultado ASC
"""

SELECT_RESULTADO_BY_PROJETO_E_DATA = """
    SELECT id_resultado, posicao, quantidade_curtidas, data_encerramento, id_projeto
    FROM resultado
    WHERE id_projeto = %s AND data_encerramento = %s
    LIMIT 1
"""
