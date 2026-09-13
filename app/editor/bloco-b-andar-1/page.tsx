'use client';
import { MapEditor, type MapEditorConfig } from '@/components/map-editor';
import {
  BLOCO_B_ANDAR_1_ELEMENTS,
  BLOCO_B_ANDAR_1_MAP,
  parseGraph,
} from '@/lib/graph';
import savedMap from '@/lib/bloco-b-andar-1-pontos.json';

const config: MapEditorConfig = {
  map: BLOCO_B_ANDAR_1_MAP,
  view: {
    width: BLOCO_B_ANDAR_1_MAP.width,
    height: BLOCO_B_ANDAR_1_MAP.height,
    content: {
      x: 0,
      y: 0,
      width: BLOCO_B_ANDAR_1_MAP.width,
      height: BLOCO_B_ANDAR_1_MAP.height,
    },
    editorImage: '/mapas/bloco-b-andar-1.svg',
    alt: 'Planta do primeiro andar do Bloco B',
    ariaLabel: 'primeiro andar do Bloco B',
  },
  title: 'Bloco B / 1º andar',
  subtitle: 'Revise as salas, banheiros, escada e caminhos deste andar.',
  workspaceLabel: 'Bloco B · 1º andar',
  storageKey: 'feira-tec:bloco-b-andar-1:graph:v1',
  downloadName: 'bloco-b-andar-1-pontos.json',
  otherMapHref: '/editor/mapas',
  otherMapLabel: 'Todos os mapas',
  initialGraph: parseGraph(
    savedMap,
    BLOCO_B_ANDAR_1_MAP,
    BLOCO_B_ANDAR_1_ELEMENTS,
  ),
  elements: BLOCO_B_ANDAR_1_ELEMENTS,
};

export default function EditorBlocoBAndar1() {
  return <MapEditor config={config} />;
}
