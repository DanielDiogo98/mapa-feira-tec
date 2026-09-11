import type { Graph, MapPoint } from './graph';
import portalData from './map-portals.json' with { type: 'json' };

export type MapPortal = {
  id: string;
  kind: 'stairs';
  label: string;
  from: { mapId: string; elementId: string };
  to: { mapId: string; elementId: string };
};

export const MAP_PORTALS = portalData as MapPortal[];

export function resolvePortalPoint(
  graph: Graph,
  endpoint: MapPortal['from'],
): MapPoint | undefined {
  if (graph.mapId !== endpoint.mapId) return undefined;
  return graph.nodes.find((point) => point.elementId === endpoint.elementId);
}
