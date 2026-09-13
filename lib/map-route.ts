import { shortestPath, type Graph } from './graph.ts';
import type { MapPortal } from './map-portals.ts';

export type RouteLocation = { mapId: string; nodeId: string };
export type RouteStage = {
  mapId: string;
  startNodeId: string;
  endNodeId: string;
  nodes: string[];
  edges: string[];
  distance: number;
};

function endpointFor(portal: MapPortal, mapId: string) {
  if (portal.from.mapId === mapId) return portal.from;
  if (portal.to.mapId === mapId) return portal.to;
  return undefined;
}

function portalNode(graph: Graph, portal: MapPortal) {
  const endpoint = endpointFor(portal, graph.mapId);
  return endpoint
    ? graph.nodes.find((node) => node.elementId === endpoint.elementId)
    : undefined;
}

export function planMultiMapRoute(
  graphs: Record<string, Graph>,
  portals: MapPortal[],
  origin: RouteLocation,
  destination: RouteLocation,
): RouteStage[] | null {
  if (!graphs[origin.mapId] || !graphs[destination.mapId]) return null;

  const queue = [origin.mapId];
  const visited = new Set(queue);
  const previous = new Map<string, { mapId: string; portal: MapPortal }>();

  while (queue.length && !visited.has(destination.mapId)) {
    const current = queue.shift()!;
    for (const portal of portals) {
      const next =
        portal.from.mapId === current
          ? portal.to.mapId
          : portal.to.mapId === current
            ? portal.from.mapId
            : undefined;
      if (!next || !graphs[next] || visited.has(next)) continue;
      visited.add(next);
      previous.set(next, { mapId: current, portal });
      queue.push(next);
    }
  }

  if (!visited.has(destination.mapId)) return null;

  const mapIds = [destination.mapId];
  const connectingPortals: MapPortal[] = [];
  while (mapIds[0] !== origin.mapId) {
    const step = previous.get(mapIds[0]);
    if (!step) return null;
    mapIds.unshift(step.mapId);
    connectingPortals.unshift(step.portal);
  }

  const stages: RouteStage[] = [];
  for (let index = 0; index < mapIds.length; index++) {
    const graph = graphs[mapIds[index]];
    const startNode =
      index === 0
        ? graph.nodes.find((node) => node.id === origin.nodeId)
        : portalNode(graph, connectingPortals[index - 1]);
    const endNode =
      index === mapIds.length - 1
        ? graph.nodes.find((node) => node.id === destination.nodeId)
        : portalNode(graph, connectingPortals[index]);
    if (!startNode || !endNode) return null;
    const path = shortestPath(graph, startNode.id, endNode.id);
    if (!path) return null;
    stages.push({
      mapId: graph.mapId,
      startNodeId: startNode.id,
      endNodeId: endNode.id,
      ...path,
    });
  }
  return stages;
}
