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
    alt: 'Planta do pátio com acesso à biblioteca',
    ariaLabel: 'Pátio, biblioteca e acessos',
  },
  title: 'Pátio / Biblioteca',
  subtitle: 'Revise os caminhos do pátio, da biblioteca e dos acessos aos blocos.',
  workspaceLabel: 'Pátio · Biblioteca',
  storageKey: 'feira-tec:patio-biblioteca-auditorio:graph:v5',
  downloadName: 'patio-biblioteca-auditorio-pontos.json',
  otherMapHref: '/editor/mapas',
  otherMapLabel: 'Todos os mapas',
  initialGraph: parseGraph(savedMap, PATIO_MAP, PATIO_ELEMENTS),
  elements: PATIO_ELEMENTS,
};

export default function EditorPatio() {
  return <MapEditor config={config} />;
}
