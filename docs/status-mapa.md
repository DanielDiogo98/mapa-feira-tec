# Estado do mapa da Feira Tecnológica

Atualizado em 12 de setembro de 2026.

## O que já funciona

- Página pública adaptada para computador e celular.
- Busca por nome do projeto, descrição, aluno, curso, série, turno, stand e ODS.
- Filtros de curso, série e turno; stand e ODS aparecem quando houver dados suficientes.
- Rotas em duas partes entre a entrada/pátio, as salas do Bloco A e o segundo andar do Bloco B.
- Pátio integrado ao corredor da biblioteca, auditório, elevador, banheiros e escada de acesso ao Bloco B, usando a disposição real revisada no Figma.
- Etiquetas do mapa reduzidas no celular para evitar sobreposição; a rota mantém visíveis somente os pontos relevantes.
- Passagem guiada pelas escadas com os botões “Já subi a escada”, “Já desci a escada” e “Voltar ao pátio”.
- Zoom, arraste, ajuste automático e seleção de destinos por toque.
- Editor local com pontos, conexões, ângulos retos, teste de rota e exportação JSON.
- Editor bloqueado por padrão na versão de produção.
- API PHP de leitura para projetos, catálogo de mapas e grafos.
- Migrações SQL para associar projetos ao mapa e armazenar os grafos.

## Plantas e grafos

| Mapa                           | SVG                  | Grafo                  | Situação                                  |
| ------------------------------ | -------------------- | ---------------------- | ----------------------------------------- |
| Pátio / biblioteca / auditório | pronto               | 26 pontos, 25 conexões | utilizável                                |
| Bloco A / salas                | pronto               | 25 pontos, 24 conexões | utilizável                                |
| Bloco B / 1º andar             | planta de referência | ainda sem pontos       | depende de confirmar acessos e portas     |
| Bloco B / 2º andar             | pronto               | 22 pontos, 22 conexões | utilizável e ligado à escada do auditório |

Todos os grafos cadastrados formam redes conectadas. As rotas públicas atuais partem da entrada da escola. A escada em frente ao auditório já está ligada ao segundo andar do Bloco B.

## Dados que ainda precisam chegar

- lista final de projetos, alunos, cursos, séries, turnos, stands e ODS;
- local exato de cada projeto (`mapa_id` e `elemento_mapa_id`);
- posição real das portas e escadas do Bloco B / 1º andar;
- definição do servidor MariaDB e do endereço onde a API será publicada.

## Próxima conferência manual recomendada

Confira no celular as rotas para os cinco laboratórios e os dois banheiros do **Bloco B · 2º andar**. A próxima planta pendente é o **Bloco B · 1º andar**.

## Validação técnica

Use `npm run check` para conferir tipos, cálculo de rotas, integridade dos JSONs e filtros. Use `npm run build` para testar a versão de produção.
