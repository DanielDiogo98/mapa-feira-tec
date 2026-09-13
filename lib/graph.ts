export const MAP = {
  id: 'bloco-a-salas',
  width: 12861,
  height: 42113,
} as const;
// Camera bounds omit the empty margin above the drawing; stored coordinates never change.
export const CONTENT = { x: 0, y: 7600, width: 12861, height: 34513 };
export type MapDefinition = {
  id: string;
  width: number;
  height: number;
};
export const PATIO_MAP = {
  id: 'patio-biblioteca-auditorio',
  width: 19062,
  height: 24297,
} as const;
export const BLOCO_B_ANDAR_1_MAP = {
  id: 'bloco-b-andar-1',
  width: 7363,
  height: 9312,
} as const;
export const BLOCO_B_ANDAR_1_ELEMENTS = [
  'escadas-acesso-andar-2',
  'banheiro-masculino',
  'banheiro-feminino',
  'saida-quadra',
  'sala-01',
  'sala-02',
  'sala-03',
  'sala-04',
  'corredor-principal',
] as const;
export const BLOCO_B_ANDAR_2_MAP = {
  id: 'bloco-b-andar-2',
  width: 7363,
  height: 14270,
} as const;
export const KINDS = {
  corridor: 'Caminho',
  door: 'Porta',
  destination: 'Destino',
  stairs: 'Escada',
  entrance: 'Entrada',
} as const;
export type NodeKind = keyof typeof KINDS;
export type MapPoint = {
  id: string;
  label: string;
  x: number;
  y: number;
  kind: NodeKind;
  elementId?: string;
};
export type Edge = { id: string; from: string; to: string };
export type Graph = {
  version: 1;
  mapId: string;
  width: number;
  height: number;
  nodes: MapPoint[];
  edges: Edge[];
};
export const emptyGraph = (map: MapDefinition = MAP): Graph => ({
  version: 1,
  mapId: map.id,
  width: map.width,
  height: map.height,
  nodes: [],
  edges: [],
});
export const ELEMENTS = [
  ...Array.from(
    { length: 8 },
    (_, i) => `sala-${String(i + 1).padStart(2, '0')}`,
  ),
  ...Array.from(
    { length: 7 },
    (_, i) => `porta-${String(i + 1).padStart(2, '0')}`,
  ),
  'corredor-01',
  'corredor-02',
  'corredor-03',
  'escada-01',
  'patio-das-salas',
];
export const PATIO_ELEMENTS = [
  'entrada-principal',
  'cantina',
  'refeitorio',
  'escadas-bloco-a-salas',
  'corredor-ligacao-setor',
  'area-patio',
  'biblioteca',
  'porta-biblioteca',
  'auditorio',
  'porta-auditorio',
  'elevador',
  'escada-acesso-bloco-b',
  'banheiro-masculino',
  'banheiro-feminino',
] as const;
export const BLOCO_B_ANDAR_2_ELEMENTS = [
  'escadas-acesso-patio',
  'banheiro-masculino',
  'banheiro-feminino',
  'sala-lab-quimica-01',
  'sala-lab-quimica-02',
  'sala-lab-tcc',
  'sala-lab-04',
  'sala-lab-maker',
  'corredor-principal',
] as const;
const idPattern = /^[a-zA-Z0-9_-]{1,80}$/;
const pairKey = (a: string, b: string) => [a, b].sort().join('|');
export function parseGraph(
  raw: unknown,
  map: MapDefinition = MAP,
  elements: readonly string[] = ELEMENTS,
): Graph {
  if (!raw || typeof raw !== 'object')
    throw new Error('O arquivo não contém um mapa válido.');
  const g = raw as Record<string, unknown>;
  if (
    g.version !== 1 ||
    g.mapId !== map.id ||
    g.width !== map.width ||
    g.height !== map.height
  )
    throw new Error(
      `Este arquivo não corresponde ao mapa ${map.id} ou à versão suportada.`,
    );
  if (
    !Array.isArray(g.nodes) ||
    !Array.isArray(g.edges) ||
    g.nodes.length > 2000 ||
    g.edges.length > 10000
  )
    throw new Error('Lista de pontos ou conexões inválida ou muito grande.');
  const ids = new Set<string>();
  const nodes: MapPoint[] = g.nodes.map((raw) => {
    if (!raw || typeof raw !== 'object') throw new Error('Ponto inválido.');
    const n = raw as MapPoint;
    if (typeof n.id !== 'string' || !idPattern.test(n.id) || ids.has(n.id))
      throw new Error('Há identificadores de pontos inválidos ou repetidos.');
    if (typeof n.label !== 'string' || !n.label.trim() || n.label.length > 80)
      throw new Error('Cada ponto precisa de um nome de até 80 caracteres.');
    if (
      !Number.isFinite(n.x) ||
      !Number.isFinite(n.y) ||
      n.x < 0 ||
      n.x > map.width ||
      n.y < 0 ||
      n.y > map.height
    )
      throw new Error('Há pontos fora dos limites da planta.');
    if (!Object.hasOwn(KINDS, n.kind))
      throw new Error('Tipo de ponto desconhecido.');
    if (n.elementId !== undefined && !elements.includes(n.elementId))
      throw new Error(
        'Um ponto está ligado a um elemento que não existe nesta planta.',
      );
    ids.add(n.id);
    return {
      id: n.id,
      label: n.label.trim(),
      x: n.x,
      y: n.y,
      kind: n.kind,
      ...(n.elementId ? { elementId: n.elementId } : {}),
    };
  });
  const edgeIds = new Set<string>(),
    pairs = new Set<string>();
  const edges: Edge[] = g.edges.map((raw) => {
    if (!raw || typeof raw !== 'object') throw new Error('Conexão inválida.');
    const e = raw as Edge;
    if (
      typeof e.id !== 'string' ||
      !idPattern.test(e.id) ||
      edgeIds.has(e.id) ||
      !ids.has(e.from) ||
      !ids.has(e.to) ||
      e.from === e.to
    )
      throw new Error(
        'Há conexões inválidas, repetidas ou com pontos ausentes.',
      );
    const pair = pairKey(e.from, e.to);
    if (pairs.has(pair))
      throw new Error('Dois pontos estão conectados mais de uma vez.');
    edgeIds.add(e.id);
    pairs.add(pair);
    return { id: e.id, from: e.from, to: e.to };
  });
  return { ...emptyGraph(map), nodes, edges };
}
export function connect(
  graph: Graph,
  from: string,
  to: string,
  id: string,
): Graph {
  if (
    from === to ||
    !graph.nodes.some((n) => n.id === from) ||
    !graph.nodes.some((n) => n.id === to) ||
    graph.edges.some((e) => pairKey(e.from, e.to) === pairKey(from, to))
  )
    return graph;
  return { ...graph, edges: [...graph.edges, { id, from, to }] };
}
export function removePoint(graph: Graph, id: string): Graph {
  return {
    ...graph,
    nodes: graph.nodes.filter((n) => n.id !== id),
    edges: graph.edges.filter((e) => e.from !== id && e.to !== id),
  };
}
export function shortestPath(
  graph: Graph,
  start: string,
  end: string,
): { nodes: string[]; edges: string[]; distance: number } | null {
  const nodes = new Map(graph.nodes.map((n) => [n.id, n]));
  if (!nodes.has(start) || !nodes.has(end)) return null;
  const adjacency = new Map<
    string,
    { to: string; edge: string; weight: number }[]
  >(graph.nodes.map((n) => [n.id, []]));
  for (const e of graph.edges) {
    const a = nodes.get(e.from),
      b = nodes.get(e.to);
    if (!a || !b) continue;
    const weight = Math.hypot(a.x - b.x, a.y - b.y);
    adjacency.get(e.from)!.push({ to: e.to, edge: e.id, weight });
    adjacency.get(e.to)!.push({ to: e.from, edge: e.id, weight });
  }
  const distance = new Map<string, number>([[start, 0]]),
    previous = new Map<string, { node: string; edge: string }>();
  const pending = new Set(nodes.keys());
  while (pending.size) {
    let nearest: string | undefined,
      best = Infinity;
    for (const id of pending) {
      const d = distance.get(id) ?? Infinity;
      if (d < best) {
        nearest = id;
        best = d;
      }
    }
    if (nearest === undefined) return null;
    if (nearest === end) {
      const path = [end],
        edges: string[] = [];
      let cursor = end;
      while (cursor !== start) {
        const p = previous.get(cursor)!;
        path.unshift(p.node);
        edges.unshift(p.edge);
        cursor = p.node;
      }
      return { nodes: path, edges, distance: best };
    }
    pending.delete(nearest);
    for (const link of adjacency.get(nearest)!) {
      if (!pending.has(link.to)) continue;
      const candidate = best + link.weight;
      if (candidate < (distance.get(link.to) ?? Infinity)) {
        distance.set(link.to, candidate);
        previous.set(link.to, { node: nearest, edge: link.edge });
      }
    }
  }
  return null;
}
export function inspectGraph(graph: Graph) {
  const connected = new Set(graph.edges.flatMap((e) => [e.from, e.to]));
  const visited = new Set<string>();
  let components = 0;
  const adjacent = new Map<string, string[]>(
    graph.nodes.map((n) => [n.id, []]),
  );
  for (const e of graph.edges) {
    adjacent.get(e.from)?.push(e.to);
    adjacent.get(e.to)?.push(e.from);
  }
  for (const n of graph.nodes) {
    if (visited.has(n.id)) continue;
    components++;
    const queue = [n.id];
    visited.add(n.id);
    while (queue.length)
      for (const id of adjacent.get(queue.pop()!) ?? [])
        if (!visited.has(id)) {
          visited.add(id);
          queue.push(id);
        }
  }
  return {
    isolated: graph.nodes.filter((n) => !connected.has(n.id)),
    components,
  };
}
