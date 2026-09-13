'use client';
import { MapEditor, type MapEditorConfig } from '@/components/map-editor';
import {
  BLOCO_B_ANDAR_2_ELEMENTS,
  BLOCO_B_ANDAR_2_MAP,
  parseGraph,
} from '@/lib/graph';
import savedMap from '@/lib/bloco-b-andar-2-pontos.json';

const config: MapEditorConfig = {
  map: BLOCO_B_ANDAR_2_MAP,
  view: {
    width: BLOCO_B_ANDAR_2_MAP.width,
    height: BLOCO_B_ANDAR_2_MAP.height,
    content: {
      x: 0,
      y: 0,
      width: BLOCO_B_ANDAR_2_MAP.width,
      height: BLOCO_B_ANDAR_2_MAP.height,
    },
    editorImage: '/mapas/bloco-b-andar-2.svg',
    alt: 'Segundo andar do Bloco B com laboratórios, banheiros e escadas',
    ariaLabel: 'segundo andar do Bloco B',
  },
  title: 'Bloco B / 2º andar',
  subtitle: 'Revise os laboratórios, banheiros, escada e caminhos deste andar.',
  workspaceLabel: 'Bloco B · 2º andar',
  storageKey: 'feira-tec:bloco-b-andar-2:graph:v1',
  downloadName: 'bloco-b-andar-2-pontos.json',
  otherMapHref: '/editor/mapas',
  otherMapLabel: 'Todos os mapas',
  initialGraph: parseGraph(
    savedMap,
    BLOCO_B_ANDAR_2_MAP,
    BLOCO_B_ANDAR_2_ELEMENTS,
  ),
  elements: BLOCO_B_ANDAR_2_ELEMENTS,
};

export default function EditorBlocoBAndar2() {
  return <MapEditor config={config} />;
}
