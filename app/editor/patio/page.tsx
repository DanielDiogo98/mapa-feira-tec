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
    editorImage: '/mapas/patio-biblioteca-auditorio-v3-clean.svg',
    publicImage: '/mapas/patio-biblioteca-auditorio-v3-clean.svg',
    alt: 'Planta do pátio com a passagem antiga interditada por obras',
    ariaLabel: 'Pátio e acesso alternativo',
  },
  title: 'Pátio / Acesso alternativo',
  subtitle: 'Revise o caminho até a escada e a faixa de interdição por obras.',
  workspaceLabel: 'Pátio · Acesso alternativo',
  storageKey: 'feira-tec:patio-biblioteca-auditorio:graph:v4',
  downloadName: 'patio-biblioteca-auditorio-pontos.json',
  otherMapHref: '/editor/mapas',
  otherMapLabel: 'Todos os mapas',
  initialGraph: parseGraph(savedMap, PATIO_MAP, PATIO_ELEMENTS),
  elements: PATIO_ELEMENTS,
};

export default function EditorPatio() {
  return <MapEditor config={config} />;
}
