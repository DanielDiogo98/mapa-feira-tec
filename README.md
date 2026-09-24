# Mapa da Feira Tecnológica

Aplicação responsiva para visitantes encontrarem projetos e receberem uma rota visual pela escola. O projeto também contém um editor técnico, separado da experiência pública, para cadastrar pontos e conexões diretamente sobre os SVGs.

As plantas públicas usam versões limpas dos SVGs: os textos antigos do Figma são removidos e substituídos por etiquetas nítidas do sistema. Salas, corredores, entradas, escadas, portas e banheiros seguem a mesma paleta em todos os andares.

## Executar o site completo

```powershell
npm install
npm run dev
```

Abra `http://localhost:3000`. A página inicial em HTML fica em `/` e o mapa
interativo em React fica em `/mapa`.

Para usar a API local pelo mesmo endereço do site, inicie o backend PHP e
defina `BACKEND_API_URL` antes de executar o frontend:

```powershell
$env:BACKEND_API_URL="http://127.0.0.1:8080/api"
npm run dev
```

## Mapas atuais

| Mapa                          | SVG    | Grafo                   |
| ----------------------------- | ------ | ----------------------- |
| Pátio, biblioteca e auditório | pronto | 26 pontos / 25 conexões |
| Bloco A · Salas               | pronto | 25 pontos / 24 conexões |
| Bloco B · 1º andar            | pronto | 20 pontos / 19 conexões |
| Bloco B · 2º andar            | pronto | 22 pontos / 22 conexões |

A página pública começa na entrada da escola. O mesmo mapa reúne o pátio, a passagem da biblioteca e do auditório, o elevador, os banheiros e a escada do Bloco B. Rotas para salas do Bloco A e para o segundo andar do Bloco B aparecem em duas partes. O primeiro andar do Bloco B aparece em três etapas: pátio, segundo andar e primeiro andar.

## Atualizar os projetos da feira

O catálogo público é gerado a partir do dump do banco de cadastro sem copiar o
arquivo original para o repositório. Senhas, chaves de acesso, RMs, e-mails e
fotos não são exportados. Para atualizar o catálogo quando chegar um novo dump:

```powershell
npm run projects:import -- "C:\caminho\para\o-banco.sql"
```

O comando atualiza `lib/projects-data.json` de forma repetível. Projetos com
turma cadastrada recebem automaticamente a sala definida em
`lib/turma-locations.json`; projetos incompletos continuam pesquisáveis e
aparecem como `Local a confirmar`. A API serve esse mesmo catálogo, garantindo
que o filtro e o mapa exibam os mesmos dados.

As turmas 1ºB, 1ºR/2ºR/3ºR e 1ºI/2ºI/3ºI ainda precisam de um destino técnico
confirmado no grafo antes de receberem rota automática.

## API PHP e MariaDB

As instruções estão em `backend/README.md`. O backend fornece projetos, catálogo de mapas e grafos somente para leitura. As migrações ficam em `database/` e preservam as tabelas atuais.

O sistema de votação e ranking desenvolvido pela Turma B está preservado em
`backend-turma-b/` e é executado junto da API PHP. As duas aplicações usam o
mesmo MySQL e são publicadas pelo mesmo serviço `api`. A origem do código, as
rotas e os cuidados de manutenção estão registrados em
`docs/integracao-backend-turma-b.md`.

## Produção no Railway

O repositório usa três serviços no mesmo projeto Railway:

- `web`: site estático e mapa React, construídos pelo `Dockerfile` da raiz;
- `api`: backend PHP do mapa e FastAPI da votação, reunidos pelo
  `backend/Dockerfile`;
- `mysql`: banco privado do Railway.

O navegador acessa a API por `/api`. O serviço `web` encaminha essas chamadas
pela rede interna do Railway, portanto somente o site precisa de domínio
público. Antes de iniciar a API, o script
`backend/scripts/initialize_database.php` cria o esquema e importa os mapas
quando o banco ainda está vazio.
