'use client';
import { MapEditor, type MapEditorConfig } from '@/components/map-editor';
import { PATIO_ELEMENTS, PATIO_MAP, parseGraph } from '@/lib/graph';
import savedMap from '@/lib/patio-biblioteca-auditorio-pontos.json';

const config: MapEditorConfig = {
  map: PATIO_MAP,
  view: {
    width: PATIO_MAP.width,
    height: PATIO_MAP.height,
    content: { x: 0, y: 0, width: PATIO_MAP.width, height: PATIO_MAP.height },
    editorImage: '/mapas/patio-biblioteca-auditorio-v2.svg',
    alt: 'Planta do pátio, biblioteca, auditório e acesso ao Bloco B',
    ariaLabel: 'Pátio, biblioteca e auditório',
  },
  title: 'Pátio / Biblioteca / Auditório',
  subtitle: 'Revise o corredor único e os acessos deste mesmo piso.',
  workspaceLabel: 'Pátio · Biblioteca · Auditório',
  storageKey: 'feira-tec:patio-biblioteca-auditorio:graph:v1',
  downloadName: 'patio-biblioteca-auditorio-pontos.json',
  otherMapHref: '/editor/mapas',
  otherMapLabel: 'Todos os mapas',
  initialGraph: parseGraph(savedMap, PATIO_MAP, PATIO_ELEMENTS),
  elements: PATIO_ELEMENTS,
};

export default function EditorPatio() {
  return <MapEditor config={config} />;
}
