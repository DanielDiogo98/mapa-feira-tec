import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  BLOCO_B_ANDAR_1_ELEMENTS,
  BLOCO_B_ANDAR_1_MAP,
  BLOCO_B_ANDAR_2_ELEMENTS,
  BLOCO_B_ANDAR_2_MAP,
  PATIO_ELEMENTS,
  PATIO_MAP,
  parseGraph,
} from '../lib/graph.ts';
import { MAP_PORTALS } from '../lib/map-portals.ts';
import { planMultiMapRoute } from '../lib/map-route.ts';

const load = (name) =>
  JSON.parse(readFileSync(new URL(`../lib/${name}`, import.meta.url), 'utf8'));

const graphs = {
  'bloco-a-salas': parseGraph(load('bloco-a-salas-pontos.json')),
  'patio-biblioteca-auditorio': parseGraph(
    load('patio-biblioteca-auditorio-pontos.json'),
    PATIO_MAP,
    PATIO_ELEMENTS,
  ),
  'bloco-b-andar-2': parseGraph(
    load('bloco-b-andar-2-pontos.json'),
    BLOCO_B_ANDAR_2_MAP,
    BLOCO_B_ANDAR_2_ELEMENTS,
  ),
  'bloco-b-andar-1': parseGraph(
    load('bloco-b-andar-1-pontos.json'),
    BLOCO_B_ANDAR_1_MAP,
    BLOCO_B_ANDAR_1_ELEMENTS,
  ),
};

test('plans a route from a Bloco B laboratory to a Bloco A room', () => {
  const route = planMultiMapRoute(
    graphs,
    MAP_PORTALS,
    {
      mapId: 'bloco-b-andar-2',
      nodeId: 'b2-quimica-01-destino',
    },
    {
      mapId: 'bloco-a-salas',
      nodeId: 'point-26977485-f656-4022-8e6f-9862a37150f4',
    },
  );
  assert.ok(route);
  assert.deepEqual(
    route.map((stage) => stage.mapId),
    ['bloco-b-andar-2', 'patio-biblioteca-auditorio', 'bloco-a-salas'],
  );
  assert.ok(route.every((stage) => stage.nodes.length > 0));
});

test('plans both directions between the two Bloco B floors', () => {
  const down = planMultiMapRoute(
    graphs,
    MAP_PORTALS,
    {
      mapId: 'bloco-b-andar-2',
      nodeId: 'b2-quimica-02-destino',
    },
    {
      mapId: 'bloco-b-andar-1',
      nodeId: 'b1-sala-01-destino',
    },
  );
  const up = planMultiMapRoute(
    graphs,
    MAP_PORTALS,
    {
      mapId: 'bloco-b-andar-1',
      nodeId: 'b1-sala-01-destino',
    },
    {
      mapId: 'bloco-b-andar-2',
      nodeId: 'b2-quimica-02-destino',
    },
  );
  assert.deepEqual(
    down?.map((stage) => stage.mapId),
    ['bloco-b-andar-2', 'bloco-b-andar-1'],
  );
  assert.deepEqual(
    up?.map((stage) => stage.mapId),
    ['bloco-b-andar-1', 'bloco-b-andar-2'],
  );
});
