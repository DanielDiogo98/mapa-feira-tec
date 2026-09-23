import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const sqlString = (value) =>
  value == null
    ? 'NULL'
    : `'${String(value).replaceAll('\\', '\\\\').replaceAll("'", "''")}'`;

const baseDump = read('database/banco-base-2026-09-02.sql')
  .split('--\n-- Banco de dados: `phpmyadmin`')[0]
  .replace(/^CREATE DATABASE[^;]+;\s*$/gim, '')
  .replace(/^USE `[^`]+`;\s*$/gim, '')
  .replace(/^START TRANSACTION;\s*$/gim, '')
  .trim();

const locationMigration = read('database/mapa-localizacao-migration.sql')
  .replaceAll('ADD COLUMN IF NOT EXISTS', 'ADD COLUMN')
  .replaceAll('CREATE UNIQUE INDEX IF NOT EXISTS', 'CREATE UNIQUE INDEX')
  .trim();
const graphMigration = read('database/mapa-grafo-migration.sql').trim();

const graphFiles = [
  'lib/patio-biblioteca-auditorio-pontos.json',
  'lib/bloco-a-salas-pontos.json',
  'lib/bloco-b-andar-2-pontos.json',
  'lib/bloco-b-andar-1-pontos.json',
];
const graphNames = {
  'patio-biblioteca-auditorio': 'Pátio · Acesso alternativo',
  'bloco-a-salas': 'Bloco A · Salas',
  'bloco-b-andar-2': 'Passagem Bloco A · Bloco B · 2º andar',
  'bloco-b-andar-1': 'Bloco B · 1º andar',
};
const graphs = graphFiles.map((file) => JSON.parse(read(file)));

const mapRows = graphs.map(
  (graph) =>
    `(${sqlString(graph.mapId)}, ${sqlString(graphNames[graph.mapId] ?? graph.mapId)}, ${Number(graph.width)}, ${Number(graph.height)}, 1)`,
);
const pointRows = graphs.flatMap((graph) =>
  graph.nodes.map(
    (node) =>
      `(${sqlString(graph.mapId)}, ${sqlString(node.id)}, ${sqlString(node.label)}, ${sqlString(node.kind)}, ${Number(node.x)}, ${Number(node.y)}, ${sqlString(node.elementId ?? null)})`,
  ),
);
const edgeRows = graphs.flatMap((graph) =>
  graph.edges.map(
    (edge) =>
      `(${sqlString(graph.mapId)}, ${sqlString(edge.id)}, ${sqlString(edge.from)}, ${sqlString(edge.to)})`,
  ),
);

const pointByElement = new Map();
for (const graph of graphs) {
  for (const node of graph.nodes) {
    if (node.elementId) {
      pointByElement.set(`${graph.mapId}:${node.elementId}`, node.id);
    }
  }
}
const portals = JSON.parse(read('lib/map-portals.json'));
const portalRows = portals.map((portal) => {
  const fromPoint = pointByElement.get(
    `${portal.from.mapId}:${portal.from.elementId}`,
  );
  const toPoint = pointByElement.get(
    `${portal.to.mapId}:${portal.to.elementId}`,
  );
  if (!fromPoint || !toPoint) {
    throw new Error(`Portal ${portal.id} aponta para um ponto inexistente.`);
  }
  return `(${sqlString(portal.from.mapId)}, ${sqlString(fromPoint)}, ${sqlString(portal.to.mapId)}, ${sqlString(toPoint)}, ${sqlString(portal.label)})`;
});

const graphSeed = `
INSERT INTO mapas (id_mapa, nome, largura, altura, ativo) VALUES
${mapRows.join(',\n')}
ON DUPLICATE KEY UPDATE nome=VALUES(nome), largura=VALUES(largura), altura=VALUES(altura), ativo=VALUES(ativo);

INSERT INTO mapa_pontos (mapa_id, id_ponto, nome, tipo, x, y, elemento_mapa_id) VALUES
${pointRows.join(',\n')};

INSERT INTO mapa_conexoes (mapa_id, id_conexao, ponto_origem_id, ponto_destino_id) VALUES
${edgeRows.join(',\n')};

INSERT INTO mapa_portais (mapa_origem_id, ponto_origem_id, mapa_destino_id, ponto_destino_id, descricao) VALUES
${portalRows.join(',\n')};
`;

const output = `-- Gerado por npm run db:build. Não edite manualmente.
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;

${baseDump}

${locationMigration}

${graphMigration}

${graphSeed}

COMMIT;
SET FOREIGN_KEY_CHECKS = 1;
`;

writeFileSync(resolve(root, 'database/railway-init.sql'), output, 'utf8');
console.log(
  `railway-init.sql: ${graphs.length} mapas, ${pointRows.length} pontos, ${edgeRows.length} conexões e ${portalRows.length} portais.`,
);
