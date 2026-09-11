# Estado do mapa da Feira Tecnológica

Atualizado em 11 de setembro de 2026.

## O que já funciona

- Página pública adaptada para computador e celular.
- Busca por nome do projeto, descrição, aluno, curso, série, turno, stand e ODS.
- Filtros de curso, série e turno; stand e ODS aparecem quando houver dados suficientes.
- Rota em duas partes entre a entrada/pátio e as salas do Bloco A.
- Pátio integrado ao corredor da biblioteca, auditório, elevador, banheiros e escada de acesso ao futuro Bloco B.
- Etiquetas do mapa reduzidas no celular para evitar sobreposição; a rota mantém visíveis somente os pontos relevantes.
- Passagem guiada pela escada com os botões “Já subi a escada” e “Voltar ao pátio”.
- Zoom, arraste, ajuste automático e seleção de destinos por toque.
- Editor local com pontos, conexões, ângulos retos, teste de rota e exportação JSON.
- Editor bloqueado por padrão na versão de produção.
- API PHP de leitura para projetos, catálogo de mapas e grafos.
- Migrações SQL para associar projetos ao mapa e armazenar os grafos.

## Plantas e grafos

| Mapa | SVG | Grafo | Situação |
| --- | --- | --- | --- |
| Pátio / biblioteca / auditório | pronto | 26 pontos, 25 conexões | utilizável |
| Bloco A / salas | pronto | 25 pontos, 24 conexões | utilizável |
| Bloco B / 1º andar | planta de referência | ainda sem pontos | depende de confirmar acessos e portas |
| Bloco B / 2º andar | aguardando planta | ainda sem pontos | receberá laboratórios e a ligação pela escada do auditório |

Todos os grafos cadastrados formam redes conectadas. As rotas públicas atuais partem da entrada da escola. O ponto da escada em frente ao auditório já está pronto para receber o portal do segundo andar do Bloco B assim que sua planta e seus acessos forem confirmados.

## Dados que ainda precisam chegar

- lista final de projetos, alunos, cursos, séries, turnos, stands e ODS;
- local exato de cada projeto (`mapa_id` e `elemento_mapa_id`);
- planta e posição real das portas, corredores e escadas do Bloco B / 2º andar;
- posição real das portas e escadas do Bloco B / 1º andar;
- definição do servidor MariaDB e do endereço onde a API será publicada.

## Próxima conferência manual recomendada

Prepare no Figma o **Bloco B · 2º andar**, com laboratórios, corredores, portas e as duas escadas. Depois exporte um único SVG; o editor já poderá receber os pontos e ligar esse andar à escada em frente ao auditório.

## Validação técnica

Use `npm run check` para conferir tipos, cálculo de rotas, integridade dos JSONs e filtros. Use `npm run build` para testar a versão de produção.
