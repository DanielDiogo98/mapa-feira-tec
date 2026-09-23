# Integração do backend da Turma B

Referência oficial da parte de votação e ranking:

- repositório: https://github.com/vitorgoncalvesb/backend-feira
- tecnologia: FastAPI com MySQL/MariaDB
- situação da revisão: os quatro testes do repositório passaram em 23/09/2026

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

## Ajustes necessários antes da publicação

1. Expor a votação pelo mesmo domínio do site. Isso evita que navegadores de
   celular bloqueiem o cookie do visitante como cookie de terceiros.
2. Configurar o FastAPI com as variáveis privadas do MySQL do Railway e com a
   origem pública real do site.
3. Adaptar a tela de votação. Atualmente ela envia `POST /api/votos` com
   `{ projectId, action }`, enquanto o backend da Turma B recebe `PUT /votos`
   com `{ id_projeto }` e exige que o visitante seja identificado antes.
4. Usar `credentials: "include"` nas chamadas que dependem do cookie e
   restaurar o voto atual ao abrir a página.
5. Alimentar a página de ranking com `GET /ranking` e `GET /ranking/podio` no
   lugar dos valores de demonstração presentes no HTML.
6. Proteger `PATCH /votacao/periodo` e `POST /votacao/encerrar`. Essas ações
   administrativas não podem ficar acessíveis a qualquer visitante.
7. Ajustar a identificação do IP para considerar com segurança o proxy do
   Railway. O código atual usa diretamente o endereço da conexão.
8. Criar testes com um banco de teste. Os testes atuais conferem as rotas, mas
   aceitam respostas de indisponibilidade e não validam um ciclo real de voto.

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

