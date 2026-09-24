import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  emptyGraph,
  parseGraph,
  connect,
  removePoint,
  shortestPath,
  inspectGraph,
  PATIO_MAP,
  PATIO_ELEMENTS,
  BLOCO_B_ANDAR_2_MAP,
  BLOCO_B_ANDAR_2_ELEMENTS,
  BLOCO_B_ANDAR_1_MAP,
  BLOCO_B_ANDAR_1_ELEMENTS,
} from '../lib/graph.ts';
import { MAP_PORTALS, resolvePortalPoint } from '../lib/map-portals.ts';
const point = (id, x, y) => ({ id, label: id, x, y, kind: 'corridor' });
const fixture = () => ({
  ...emptyGraph(),
  nodes: [
    point('a', 100, 100),
    point('b', 200, 100),
    point('c', 300, 100),
    point('d', 200, 900),
  ],
  edges: [
    { id: 'ab', from: 'a', to: 'b' },
    { id: 'bc', from: 'b', to: 'c' },
    { id: 'ad', from: 'a', to: 'd' },
    { id: 'dc', from: 'd', to: 'c' },
  ],
});
test('weighted route chooses the short branch and works in both directions', () => {
  assert.deepEqual(shortestPath(fixture(), 'a', 'c').nodes, ['a', 'b', 'c']);
  assert.deepEqual(shortestPath(fixture(), 'c', 'a').nodes, ['c', 'b', 'a']);
  assert.equal(shortestPath(fixture(), 'a', 'c').distance, 200);
});
test('disconnected, missing and same-node endpoints', () => {
  const g = fixture();
  g.nodes.push(point('z', 800, 800));
  assert.equal(shortestPath(g, 'a', 'z'), null);
  assert.equal(shortestPath(g, 'a', 'missing'), null);
  assert.deepEqual(shortestPath(g, 'a', 'a').nodes, ['a']);
  assert.equal(inspectGraph(g).components, 2);
  assert.equal(inspectGraph(g).isolated[0].id, 'z');
});
test('duplicate and self links cannot be created; deleting a node removes incident links', () => {
  const g = fixture();
  assert.equal(connect(g, 'b', 'a', 'duplicate'), g);
  assert.equal(connect(g, 'a', 'a', 'self'), g);
  const clean = removePoint(g, 'b');
  assert.equal(clean.edges.length, 2);
  assert.deepEqual(shortestPath(clean, 'a', 'c').nodes, ['a', 'd', 'c']);
});
test('round trip preserves coordinates and associations', () => {
  const g = fixture();
  g.nodes[0].elementId = 'sala-02';
  assert.deepEqual(parseGraph(JSON.parse(JSON.stringify(g))), g);
});
test('reject incompatible files, dangling edges and invalid coordinates', () => {
  assert.throws(() => parseGraph({ ...fixture(), mapId: 'other' }));
  const g = fixture();
  g.nodes[0].x = NaN;
  assert.throws(() => parseGraph(g));
  const h = fixture();
  h.edges.push({ id: 'bad', from: 'a', to: 'missing' });
  assert.throws(() => parseGraph(h));
  assert.throws(() =>
    parseGraph({ ...fixture(), nodes: [point('a', 1, 1), point('a', 2, 2)] }),
  );
  const j = fixture();
  j.edges.push({ id: 'ba', from: 'b', to: 'a' });
  assert.throws(() => parseGraph(j));
});

test('patio graph is connected and every public destination is reachable', () => {
  const raw = JSON.parse(
    readFileSync(
      new URL('../lib/patio-biblioteca-auditorio-pontos.json', import.meta.url),
      'utf8',
    ),
  );
  const graph = parseGraph(raw, PATIO_MAP, PATIO_ELEMENTS);
  const entrance = graph.nodes.find(
    (node) => node.elementId === 'entrada-principal',
  );
  const destinations = graph.nodes.filter(
    (node) => node.kind === 'destination',
  );
  assert.equal(inspectGraph(graph).components, 1);
  assert.equal(inspectGraph(graph).isolated.length, 0);
  assert.ok(entrance);
  assert.equal(destinations.length, 4);
  assert.ok(destinations.some((node) => node.elementId === 'biblioteca'));
  assert.ok(destinations.some((node) => node.id === 'patio-destino'));
  assert.equal(
    graph.nodes.some((node) => node.label === 'Auditório'),
    false,
  );
  for (const destination of destinations) {
    assert.ok(shortestPath(graph, entrance.id, destination.id));
  }
});

test('the library passage is open and connected to the patio', () => {
  const raw = JSON.parse(
    readFileSync(
      new URL('../lib/patio-biblioteca-auditorio-pontos.json', import.meta.url),
      'utf8',
    ),
  );
  const graph = parseGraph(raw, PATIO_MAP, PATIO_ELEMENTS);
  const entrance = graph.nodes.find(
    (node) => node.elementId === 'entrada-principal',
  );
  const library = graph.nodes.find(
    (node) => node.elementId === 'biblioteca',
  );
  assert.ok(entrance);
  assert.ok(library);
  assert.ok(shortestPath(graph, entrance.id, library.id));
});

test('the stairs portal joins the patio route to the Bloco A route', () => {
  const patioRaw = JSON.parse(
    readFileSync(
      new URL('../lib/patio-biblioteca-auditorio-pontos.json', import.meta.url),
      'utf8',
    ),
  );
  const blocoARaw = JSON.parse(
    readFileSync(
      new URL('../lib/bloco-a-salas-pontos.json', import.meta.url),
      'utf8',
    ),
  );
  const patioGraph = parseGraph(patioRaw, PATIO_MAP, PATIO_ELEMENTS);
  const blocoAGraph = parseGraph(blocoARaw);
  const portal = MAP_PORTALS.find(
    (item) => item.id === 'escada-patio-bloco-a-salas',
  );
  assert.ok(portal);
  const downstairs = resolvePortalPoint(patioGraph, portal.from);
  const upstairs = resolvePortalPoint(blocoAGraph, portal.to);
  const entrance = patioGraph.nodes.find(
    (node) => node.elementId === 'entrada-principal',
  );
  const room = blocoAGraph.nodes.find((node) => node.elementId === 'sala-02');
  assert.ok(downstairs);
  assert.ok(upstairs);
  assert.ok(entrance);
  assert.ok(room);
  assert.ok(shortestPath(patioGraph, entrance.id, downstairs.id));
  assert.ok(shortestPath(blocoAGraph, upstairs.id, room.id));
});

test('the Bloco B second floor is connected and every destination is reachable', () => {
  const raw = JSON.parse(
    readFileSync(
      new URL('../lib/bloco-b-andar-2-pontos.json', import.meta.url),
      'utf8',
    ),
  );
  const graph = parseGraph(raw, BLOCO_B_ANDAR_2_MAP, BLOCO_B_ANDAR_2_ELEMENTS);
  const stairs = graph.nodes.find(
    (node) => node.elementId === 'escadas-acesso-patio',
  );
  const destinations = graph.nodes.filter(
    (node) => node.kind === 'destination',
  );
  assert.equal(inspectGraph(graph).components, 1);
  assert.equal(inspectGraph(graph).isolated.length, 0);
  assert.ok(stairs);
  assert.equal(destinations.length, 13);
  assert.ok(
    destinations.some((node) => node.elementId === 'sala-lab-mbiol'),
  );
  assert.ok(
    destinations.some((node) => node.elementId === 'sala-lab-instrumental'),
  );
  for (const destination of destinations) {
    assert.ok(shortestPath(graph, stairs.id, destination.id));
  }
});

test('the Bloco A stairs portal joins the patio to the alternative passage', () => {
  const patioRaw = JSON.parse(
    readFileSync(
      new URL('../lib/patio-biblioteca-auditorio-pontos.json', import.meta.url),
      'utf8',
    ),
  );
  const blocoBRaw = JSON.parse(
    readFileSync(
      new URL('../lib/bloco-b-andar-2-pontos.json', import.meta.url),
      'utf8',
    ),
  );
  const patioGraph = parseGraph(patioRaw, PATIO_MAP, PATIO_ELEMENTS);
  const blocoBGraph = parseGraph(
    blocoBRaw,
    BLOCO_B_ANDAR_2_MAP,
    BLOCO_B_ANDAR_2_ELEMENTS,
  );
  const portal = MAP_PORTALS.find(
    (item) => item.id === 'escada-patio-passagem-labs-bloco-a',
  );
  assert.ok(portal);
  const patioStairs = resolvePortalPoint(patioGraph, portal.from);
  const blocoBStairs = resolvePortalPoint(blocoBGraph, portal.to);
  const entrance = patioGraph.nodes.find(
    (node) => node.elementId === 'entrada-principal',
  );
  assert.ok(patioStairs);
  assert.ok(blocoBStairs);
  assert.ok(entrance);
  assert.ok(shortestPath(patioGraph, entrance.id, patioStairs.id));
  assert.ok(
    shortestPath(blocoBGraph, blocoBStairs.id, 'passagem-lab-01-destino'),
  );
  assert.ok(shortestPath(blocoBGraph, blocoBStairs.id, 'b2-maker-destino'));
});

test('the Bloco B first floor is connected and every destination is reachable', () => {
  const raw = JSON.parse(
    readFileSync(
      new URL('../lib/bloco-b-andar-1-pontos.json', import.meta.url),
      'utf8',
    ),
  );
  const graph = parseGraph(raw, BLOCO_B_ANDAR_1_MAP, BLOCO_B_ANDAR_1_ELEMENTS);
  const stairs = graph.nodes.find(
    (node) => node.elementId === 'escadas-acesso-andar-2',
  );
  const destinations = graph.nodes.filter(
    (node) => node.kind === 'destination',
  );
  assert.equal(inspectGraph(graph).components, 1);
  assert.equal(inspectGraph(graph).isolated.length, 0);
  assert.ok(stairs);
  assert.equal(destinations.length, 7);
  for (const destination of destinations) {
    assert.ok(shortestPath(graph, stairs.id, destination.id));
  }
});

test('the Bloco B stairs join the second and first floors', () => {
  const secondFloorRaw = JSON.parse(
    readFileSync(
      new URL('../lib/bloco-b-andar-2-pontos.json', import.meta.url),
      'utf8',
    ),
  );
  const firstFloorRaw = JSON.parse(
    readFileSync(
      new URL('../lib/bloco-b-andar-1-pontos.json', import.meta.url),
      'utf8',
    ),
  );
  const secondFloor = parseGraph(
    secondFloorRaw,
    BLOCO_B_ANDAR_2_MAP,
    BLOCO_B_ANDAR_2_ELEMENTS,
  );
  const firstFloor = parseGraph(
    firstFloorRaw,
    BLOCO_B_ANDAR_1_MAP,
    BLOCO_B_ANDAR_1_ELEMENTS,
  );
  const portal = MAP_PORTALS.find(
    (item) => item.id === 'escada-bloco-b-andar-2-andar-1',
  );
  assert.ok(portal);
  const upperStairs = resolvePortalPoint(secondFloor, portal.from);
  const lowerStairs = resolvePortalPoint(firstFloor, portal.to);
  assert.ok(upperStairs);
  assert.ok(lowerStairs);
  assert.ok(shortestPath(firstFloor, lowerStairs.id, 'b1-sala-01-destino'));
});
