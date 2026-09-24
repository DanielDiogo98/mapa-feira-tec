import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const readJson = async (path) =>
  JSON.parse(await readFile(new URL(path, root), 'utf8'));

test('catálogo público não contém campos privados do banco de origem', async () => {
  const projects = await readJson('lib/projects-data.json');
  const forbidden = new Set([
    'email',
    'rm',
    'senha',
    'senha_hash',
    'senha_acesso',
    'chave_acesso',
    'foto',
  ]);
  const visit = (value) => {
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      assert.ok(!forbidden.has(key), `campo privado encontrado: ${key}`);
      visit(child);
    }
  };
  visit(projects);
  assert.equal(
    new Set(projects.map((project) => project.id)).size,
    projects.length,
  );
});

test('catálogo preserva os vínculos entre alunos e seus projetos', async () => {
  const projects = await readJson('lib/projects-data.json');
  const coroaAfro = projects.find((project) =>
    project.name.includes('CoroaAfro'),
  );
  const vitalize = projects.find((project) => project.name === 'Vitalize');
  assert.ok(coroaAfro, 'CoroaAfro não encontrado');
  assert.ok(vitalize, 'Vitalize não encontrado');
  assert.ok(
    coroaAfro.students.some((name) => name === 'Felipe José Borges de Mello'),
    'Felipe não está associado ao CoroaAfro',
  );
  assert.ok(
    vitalize.students.some((name) => name === 'Leticia Vasconcelos da Silva'),
    'Leticia não está associada ao Vitalize',
  );
  assert.equal(projects.length, 134);
});

test('toda localização de projeto aponta para um destino existente', async () => {
  const projects = await readJson('lib/projects-data.json');
  const graphFiles = [
    'lib/patio-biblioteca-auditorio-pontos.json',
    'lib/bloco-a-salas-pontos.json',
    'lib/bloco-b-andar-2-pontos.json',
    'lib/bloco-b-andar-1-pontos.json',
  ];
  const graphs = await Promise.all(graphFiles.map(readJson));
  const destinations = new Set(
    graphs.flatMap((graph) =>
      graph.nodes
        .filter((node) => node.kind === 'destination' && node.elementId)
        .map((node) => `${graph.mapId}:${node.elementId}`),
    ),
  );
  for (const project of projects) {
    if (!project.location) continue;
    assert.ok(
      destinations.has(
        `${project.location.mapId}:${project.location.elementId}`,
      ),
      `destino inexistente do projeto ${project.id}`,
    );
  }
});

test('numeração do Bloco A segue a planta oficial', async () => {
  const graph = await readJson('lib/bloco-a-salas-pontos.json');
  const rooms = Object.fromEntries(
    graph.nodes
      .filter((node) => node.kind === 'destination')
      .map((node) => [node.elementId, node]),
  );
  assert.ok(rooms['sala-03'].x < rooms['sala-08'].x);
  assert.ok(Math.abs(rooms['sala-03'].y - rooms['sala-08'].y) < 100);
  assert.ok(rooms['sala-04'].x < rooms['sala-07'].x);
  assert.ok(Math.abs(rooms['sala-04'].y - rooms['sala-07'].y) < 150);
  assert.ok(rooms['sala-05'].x < rooms['sala-06'].x);
  assert.ok(Math.abs(rooms['sala-05'].y - rooms['sala-06'].y) < 150);
});

test('turmas novas do Bloco B apontam para as salas 5 e 6', async () => {
  const locations = await readJson('lib/turma-locations.json');
  assert.deepEqual(
    [locations['1B'].mapId, locations['1B'].elementId],
    ['bloco-b-andar-1', 'sala-05'],
  );
  for (const turma of ['1R', '2R', '3R']) {
    assert.deepEqual(
      [locations[turma].mapId, locations[turma].elementId],
      ['bloco-b-andar-1', 'sala-06'],
    );
  }
});
