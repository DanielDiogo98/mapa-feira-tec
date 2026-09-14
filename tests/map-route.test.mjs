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

test('keeps the patio route direction from Bloco B stairs to Bloco A stairs', () => {
  const sala7 = graphs['bloco-a-salas'].nodes.find(
    (node) => node.elementId === 'sala-07',
  );
  assert.ok(sala7);
  const route = planMultiMapRoute(
    graphs,
    MAP_PORTALS,
    {
      mapId: 'bloco-b-andar-1',
      nodeId: 'b1-banheiro-masculino-destino',
    },
    { mapId: 'bloco-a-salas', nodeId: sala7.id },
  );
  const patioStage = route?.find(
    (stage) => stage.mapId === 'patio-biblioteca-auditorio',
  );
  assert.ok(patioStage);
  const patioStart = graphs['patio-biblioteca-auditorio'].nodes.find(
    (node) => node.id === patioStage.startNodeId,
  );
  const patioEnd = graphs['patio-biblioteca-auditorio'].nodes.find(
    (node) => node.id === patioStage.endNodeId,
  );
  assert.equal(patioStart?.elementId, 'escada-acesso-bloco-b');
  assert.equal(patioEnd?.elementId, 'escadas-bloco-a-salas');
  assert.equal(patioStage.nodes[0], patioStage.startNodeId);
  assert.equal(patioStage.nodes.at(-1), patioStage.endNodeId);
});

test(
  'every public location can route to every other public location',
  { timeout: 20000 },
  () => {
    const locations = Object.values(graphs).flatMap((graph) =>
      graph.nodes
        .filter(
          (node) =>
            node.kind === 'destination' ||
            node.kind === 'entrance' ||
            node.elementId === 'escada-acesso-bloco-b',
        )
        .map((node) => ({
          mapId: graph.mapId,
          nodeId: node.id,
          label: node.label,
        })),
    );
    for (const origin of locations) {
      for (const destination of locations) {
        if (
          origin.mapId === destination.mapId &&
          origin.nodeId === destination.nodeId
        )
          continue;
        assert.ok(
          planMultiMapRoute(graphs, MAP_PORTALS, origin, destination),
          `Sem rota de ${origin.label} para ${destination.label}`,
        );
      }
    }
  },
);
