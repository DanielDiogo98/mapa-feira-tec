# Integração do backend da Turma B

Referência oficial da parte de votação e ranking:

- repositório: https://github.com/vitorgoncalvesb/backend-feira
- tecnologia: FastAPI com MySQL/MariaDB
- situação da revisão: integrado ao repositório principal em 23/09/2026; os
  cinco testes passam, incluindo a proteção das rotas administrativas

O código original foi incorporado com `git subtree` em `backend-turma-b/`.
Assim, a autoria e a separação do trabalho da Turma B permanecem claras e
atualizações futuras podem ser comparadas com o repositório de origem.

## Responsabilidade de cada backend

O backend PHP atual continua responsável pelos dados usados pelo mapa:

- catálogo e filtros de projetos;
- lista de mapas;
- pontos, conexões e portais entre andares.

O backend da Turma B completa as funções de votação:

- identificação do visitante por cookie;
- consulta, criação, troca e remoção do voto;
- período de votação;
- ranking em tempo real;
- pódio e resultado final.

## Compatibilidade com o banco atual

As tabelas que o backend da Turma B usa já existem em
`database/railway-init.sql` com os mesmos campos esperados:

- `visitante`;
- `curtidas`;
- `periodo_votacao`;
- `projetos`;
- `resultado`.

Por isso, os dois backends podem usar o mesmo MySQL do Railway. O arquivo
`banco_manha.sql` do repositório da Turma B não deve ser importado inteiro no
banco de produção, pois ele contém tabelas e dados de exemplo que divergem da
base oficial usada pelo mapa.

## Ajustes aplicados para a publicação

1. A API PHP e o FastAPI são executados no mesmo contêiner e publicados por um
   único gateway.
2. As duas aplicações usam as mesmas variáveis privadas do MySQL do Railway.
3. O cookie pode ser configurado como `Secure` e `SameSite=None` em produção.
4. A identificação do visitante considera o IP encaminhado pelo proxy.
5. As ações de configurar e encerrar a votação exigem `X-Admin-Token`.
6. A documentação Swagger está disponível em `/api/voting/docs`.

Ainda será necessário adaptar a tela de votação quando ela receber os projetos
reais. Atualmente ela envia `POST /api/votos` com `{ projectId, action }`, mas
o contrato oficial recebe `PUT /api/votos` com `{ id_projeto }` e exige a
identificação prévia do visitante. O ranking visual também continua com dados
de demonstração até a equipe autorizar a alteração dessa tela.

## Sequência de integração

1. Receber e validar a versão final do banco e a lista definitiva de projetos.
2. Incorporar o serviço de votação preservando o histórico e os créditos da
   Turma B.
3. Criar uma única entrada `/api` para o navegador, encaminhando cada rota ao
   backend correto.
4. Conectar a tela de votação e o ranking aos dados reais.
5. Testar identificação, voto, troca de voto, remoção, ranking e encerramento
   em um banco separado.
6. Publicar no Railway e fazer um teste completo em celular antes de liberar a
   votação.

## Rotas previstas

| Função | Rota da Turma B |
| --- | --- |
| Identificar visitante | `POST /visitantes/identificar` |
| Consultar voto atual | `GET /votos/meu-voto` |
| Criar ou trocar voto | `PUT /votos` |
| Remover voto | `DELETE /votos` |
| Consultar período | `GET /votacao/status` |
| Configurar período | `PATCH /votacao/periodo` |
| Encerrar votação | `POST /votacao/encerrar` |
| Ranking atual | `GET /ranking` |
| Pódio | `GET /ranking/podio` |
| Resultado final | `GET /ranking/resultado-final` |
