SELECT_ALL_PROJETOS = """
    SELECT id_projeto, turno, nome_projeto, descricao
    FROM projetos
    WHERE catalogo_publico = 1
    ORDER BY id_projeto ASC
"""
