# API PHP do mapa

1. Copie `config.example.php` para `config.php` e ajuste o acesso ao MariaDB.
2. Execute `database/mapa-localizacao-migration.sql` e `database/mapa-grafo-migration.sql` no banco atual.
3. Aponte o Apache para a pasta `backend/public` ou inicie localmente com:

   `C:\xampp\php\php.exe -S localhost:8080 -t backend/public`

Rotas disponíveis:

- `GET /api/health`
- `GET /api/projects?q=&course=&series=&shift=&stand=&ods=&mapId=&hasLocation=1`
- `GET /api/maps`
- `GET /api/portals`
- `GET /api/maps/{mapa-id}/graph`

Para importar um JSON produzido pelo editor:

`C:\xampp\php\php.exe backend/scripts/import_graph.php lib/bloco-a-salas-pontos.json`

Ao importar o segundo dos dois grafos, o script reconhece `lib/map-portals.json` e grava automaticamente a passagem da escada. O arquivo `database/mapa-portais-seed.sql` permite repetir somente essa etapa quando necessário.

O endpoint é somente leitura. Isso evita que qualquer visitante altere os caminhos do mapa; a publicação de grafos continua sendo uma tarefa administrativa.
