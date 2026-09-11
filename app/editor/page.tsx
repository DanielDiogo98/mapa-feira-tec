'use client';
import { MapEditor, type MapEditorConfig } from '@/components/map-editor';
import { CONTENT, ELEMENTS, MAP, parseGraph } from '@/lib/graph';
import savedMap from '@/lib/bloco-a-salas-pontos.json';

const config: MapEditorConfig = {
  map: MAP,
  view: {
    width: MAP.width,
    height: MAP.height,
    content: CONTENT,
    editorImage: '/mapas/bloco-a-salas-visual.svg',
    publicImage: '/mapas/bloco-a-salas-clean.svg',
    alt: 'Planta do Bloco A: salas, corredores, portas, pátio e escadas',
    ariaLabel: 'Bloco A',
  },
  title: 'Bloco A / Salas',
  subtitle: 'Prepare os caminhos da feira.',
  workspaceLabel: 'Bloco A',
  storageKey: 'feira-tec:bloco-a-salas:graph:v2',
  downloadName: 'bloco-a-salas-pontos.json',
  otherMapHref: '/editor/mapas',
  otherMapLabel: 'Todos os mapas',
  initialGraph: parseGraph(savedMap),
  elements: ELEMENTS,
};

export default function EditorBlocoA() {
  return <MapEditor config={config} />;
}
