# Feira Tecnológica - Backend de Votação

Backend em FastAPI conectado diretamente ao MariaDB/MySQL.

## Visão geral

Este projeto implementa o sistema de votação da Feira Tecnológica com:

- identificação de visitante por cookie + IP + user-agent
- controle de período de votação
- registro, troca e remoção de voto
- cálculo de ranking em tempo real
- pódio
- encerramento da votação e geração do resultado final
- documentação Swagger/OpenAPI
- testes básicos de rotas

## Tecnologias

- Python 3.12
- FastAPI
- MariaDB / MySQL
- mysql-connector-python
- Pydantic
- python-dotenv
- pytest

## Estrutura do projeto

```text
backend/
├── app/
│   ├── database/
│   │   ├── connection.py
│   │   └── queries/
│   ├── routes/
│   ├── schemas/
│   ├── services/
│   ├── config.py
│   ├── main.py
│   └── __init__.py
├── tests/
├── .env
├── .env.example
├── requirements.txt
├── README.md
├── teste_frontend.html
└── ...
```

## Requisitos

- Python 3.12+
- MariaDB/MySQL em execução local
- XAMPP, WAMP ou outra instalação do MariaDB/MySQL
- Navegador para testar a interface HTML

## Configuração do ambiente

Crie o arquivo `.env` dentro da pasta `backend` com base no exemplo:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=banco_manha
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:8080,null
```

> Se o seu XAMPP usa senha vazia para o usuário `root`, deixe `DB_PASSWORD=` em branco. Caso contrário, informe a senha correta.

## Instalação

```powershell
cd F:\backend-feira\backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## Execução do backend

```powershell
cd F:\backend-feira\backend
.\.venv\Scripts\Activate.ps1
py -3.12 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Swagger/OpenAPI:

- http://localhost:8000/docs
- http://localhost:8000/redoc

## Teste com o HTML local

Para testar a API via navegador, primeiro sirva a página HTML em HTTP local:

```powershell
cd F:\backend-feira\backend
py -3.12 -m http.server 8080
```

Depois abra:

```text
http://localhost:8080/teste_frontend.html
```

Importante:

- não abra o arquivo como `file:///...`
- isso bloqueia cookies e CORS
- o navegador precisa receber a página em HTTP

## Fluxo de teste recomendado

1. abrir a página `http://localhost:8080/teste_frontend.html`
2. clicar em “Identificar visitante”
3. verificar se o cookie `visitante_id` foi salvo
4. configurar o período de votação
5. registrar um voto
6. consultar meu voto
7. consultar o ranking
8. encerrar a votação

## Banco de dados

O backend usa as tabelas já existentes do banco `banco_manha`, sem duplicar estruturas:

- `visitante`
- `curtidas`
- `periodo_votacao`
- `projetos`
- `resultado`

## Endpoints principais

### Visitantes

- `POST /visitantes/identificar`

### Votos

- `GET /votos/meu-voto`
- `PUT /votos`
- `DELETE /votos`

### Período

- `GET /votacao/status`
- `PATCH /votacao/periodo`
- `POST /votacao/encerrar`

### Ranking

- `GET /ranking`
- `GET /ranking/podio`
- `GET /resultado-final`

## Regras de negócio

- O backend valida o período antes de permitir qualquer criação, troca ou remoção de voto.
- O front-end pode esconder ações, mas o backend é a fonte final de verdade.
- Um visitante pode ter apenas um voto ativo por vez.
- O ranking considera somente votos ativos.
- A tabela `curtidas` usa o campo `ativa` para representar o estado do voto.
- O cookie `visitante_id` representa a identificação do visitante no navegador.
- IPs podem ser compartilhados, cookies podem ser apagados e vários usuários podem usar o mesmo IP, então a combinação de IP + cookie não é garantia absoluta de identidade individual.

## Exemplos de requisição

### Identificar visitante

```bash
curl -X POST http://localhost:8000/visitantes/identificar \
  -H "User-Agent: Mozilla/5.0"
```

### Consultar meu voto

```bash
curl http://localhost:8000/votos/meu-voto \
  -H "Cookie: visitante_id=1"
```

### Registrar voto

```bash
curl -X PUT http://localhost:8000/votos \
  -H "Cookie: visitante_id=1" \
  -H "Content-Type: application/json" \
  -d '{"id_projeto": 2}'
```

### Ranking

```bash
curl http://localhost:8000/ranking
```

### Status do período

```bash
curl http://localhost:8000/votacao/status
```

## Validação e testes

```powershell
cd F:\backend-feira\backend
.\.venv\Scripts\Activate.ps1
py -3.12 -m pytest -q
```

## Observações finais

- Não foi usado ORM, SQLAlchemy ou Alembic.
- Todas as consultas SQL usam parâmetros.
- O código mantém a lógica separada em queries, services e routes.
- O banco já existente foi respeitado sem criar tabelas paralelas.

## Licença

Projeto desenvolvido para fins acadêmicos e de apresentação da Feira Tecnológica.
