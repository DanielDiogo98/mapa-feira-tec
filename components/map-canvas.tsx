'use client';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Plus, Minus, Maximize, RotateCcw } from 'lucide-react';
import { CONTENT, MAP, type Graph, type MapPoint } from '@/lib/graph';
export type Mode = 'move' | 'add' | 'connect';
type Point = { x: number; y: number };
type Camera = Point & { scale: number };

function orthogonalPath(a: Point, b: Point) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (Math.abs(dx) < 0.5 || Math.abs(dy) < 0.5) {
    return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  }
  const horizontalFirst = Math.abs(dx) >= Math.abs(dy);
  const radius = Math.min(14, Math.abs(dx) / 2, Math.abs(dy) / 2);
  if (horizontalFirst) {
    const corner = { x: b.x, y: a.y };
    return [
      `M ${a.x} ${a.y}`,
      `L ${corner.x - Math.sign(dx) * radius} ${corner.y}`,
      `Q ${corner.x} ${corner.y} ${corner.x} ${corner.y + Math.sign(dy) * radius}`,
      `L ${b.x} ${b.y}`,
    ].join(' ');
  }
  const corner = { x: a.x, y: b.y };
  return [
    `M ${a.x} ${a.y}`,
    `L ${corner.x} ${corner.y - Math.sign(dy) * radius}`,
    `Q ${corner.x} ${corner.y} ${corner.x + Math.sign(dx) * radius} ${corner.y}`,
    `L ${b.x} ${b.y}`,
  ].join(' ');
}
export type MapView = {
  width: number;
  height: number;
  content: { x: number; y: number; width: number; height: number };
  editorImage: string;
  publicImage?: string;
  alt: string;
  ariaLabel: string;
};
const DEFAULT_VIEW: MapView = {
  width: MAP.width,
  height: MAP.height,
  content: CONTENT,
  editorImage: '/mapas/bloco-a-salas-visual.svg',
  publicImage: '/mapas/bloco-a-salas-clean.svg',
  alt: 'Planta do Bloco A: salas, corredores, portas, pátio e escadas',
  ariaLabel: 'Bloco A',
};
export type CanvasHandle = {
  fit: () => void;
  focusPoint: (point: MapPoint) => void;
};
type Props = {
  graph: Graph;
  mode: Mode;
  selected: string;
  selectedEdge: string;
  connectionFrom: string;
  routeEdges: string[];
  presentation?: boolean;
  mapView?: MapView;
  onAdd: (point: Point) => void;
  onSelect: (id: string) => void;
  onSelectEdge: (id: string) => void;
  onMove: (id: string, point: Point) => void;
  onDelete: (id: string) => void;
};
export const MapCanvas = forwardRef<CanvasHandle, Props>(function MapCanvas(
  {
    graph,
    mode,
    selected,
    selectedEdge,
    connectionFrom,
    routeEdges,
    presentation = false,
    mapView = DEFAULT_VIEW,
    onAdd,
    onSelect,
    onSelectEdge,
    onMove,
    onDelete,
  },
  ref,
) {
  const surface = useRef<HTMLDivElement>(null),
    image = useRef<HTMLImageElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<{
    start: Point;
    last: Point;
    node?: MapPoint;
    edge?: string;
    moved: boolean;
    multi: boolean;
  } | null>(null);
  const current = useRef<Camera>({ x: 0, y: 0, scale: 0.02 });
  const fitScale = useRef(0.02);
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, scale: 0.02 }),
    [fitScaleValue, setFitScaleValue] = useState(0.02),
    [draft, setDraft] = useState<MapPoint | null>(null);
  const draftRef = useRef<MapPoint | null>(null);
  const [ready, setReady] = useState(true),
    [failed, setFailed] = useState(false),
    [retry, setRetry] = useState(0);
  const [dragging, setDragging] = useState(false);
  const update = useCallback((c: Camera) => {
    current.current = c;
    setCamera(c);
  }, []);
  const fit = useCallback(() => {
    const el = surface.current;
    if (!el) return;
    const scale = Math.max(
      0.0001,
      Math.min(
        (el.clientWidth - 64) / mapView.content.width,
        (el.clientHeight - 72) / mapView.content.height,
      ),
    );
    fitScale.current = scale;
    setFitScaleValue(scale);
    update({
      scale,
      x:
        (el.clientWidth - mapView.content.width * scale) / 2 -
        mapView.content.x * scale,
      y:
        (el.clientHeight - mapView.content.height * scale) / 2 -
        mapView.content.y * scale,
    });
  }, [mapView, update]);
  const zoom = useCallback(
    (factor: number, anchor?: Point) => {
      const el = surface.current;
      if (!el) return;
      const c = current.current,
        p = anchor ?? { x: el.clientWidth / 2, y: el.clientHeight / 2 };
      const scale = Math.max(
          fitScale.current * 0.6,
          Math.min(fitScale.current * 32, c.scale * factor),
        ),
        r = scale / c.scale;
      update({ scale, x: p.x - (p.x - c.x) * r, y: p.y - (p.y - c.y) * r });
    },
    [update],
  );
  useImperativeHandle(
    ref,
    () => ({
      fit,
      focusPoint: (p) => {
        const el = surface.current;
        if (!el) return;
        const scale = Math.max(current.current.scale, fitScale.current * 3);
        update({
          scale,
          x: el.clientWidth / 2 - p.x * scale,
          y: el.clientHeight / 2 - p.y * scale,
        });
      },
    }),
    [fit, update],
  );
  useEffect(() => {
    const el = surface.current;
    if (!el) return;
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    fit();
    const frame = window.requestAnimationFrame(fit);
    const fitTimer = window.setTimeout(fit, 120);
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      zoom(Math.exp(-e.deltaY * 0.0015), {
        x: e.clientX - r.left,
        y: e.clientY - r.top,
      });
    };
    el.addEventListener('wheel', wheel, { passive: false });
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(fitTimer);
      observer.disconnect();
      el.removeEventListener('wheel', wheel);
    };
  }, [fit, zoom]);
  useEffect(() => {
    pointers.current.clear();
    gesture.current = null;
    setDraft(null);
    draftRef.current = null;
    setDragging(false);
  }, [mode]);
  const pointAt = (e: React.PointerEvent) => {
    const r = surface.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const mapPoint = (p: Point) => ({
    x: (p.x - current.current.x) / current.current.scale,
    y: (p.y - current.current.y) / current.current.scale,
  });
  const clamp = (p: Point) => ({
    x: Math.round(Math.max(0, Math.min(mapView.width, p.x)) * 100) / 100,
    y: Math.round(Math.max(0, Math.min(mapView.height, p.y)) * 100) / 100,
  });
  function down(e: React.PointerEvent) {
    if (!ready || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const p = pointAt(e);
    pointers.current.set(e.pointerId, p);
    surface.current!.setPointerCapture(e.pointerId);
    if (pointers.current.size > 1) {
      if (gesture.current) gesture.current.multi = true;
      draftRef.current = null;
      setDraft(null);
      return;
    }
    const target = e.target as Element;
    const id = target.closest('[data-point]')?.getAttribute('data-point');
    const edge = target.closest('[data-edge]')?.getAttribute('data-edge');
    gesture.current = {
      start: p,
      last: p,
      node: graph.nodes.find((n) => n.id === id),
      edge: edge ?? undefined,
      moved: false,
      multi: false,
    };
    setDragging(true);
    if (!id) surface.current!.focus();
  }
  function move(e: React.PointerEvent) {
    const g = gesture.current;
    if (!g || !pointers.current.has(e.pointerId)) return;
    const old = [...pointers.current.values()],
      p = pointAt(e);
    pointers.current.set(e.pointerId, p);
    const next = [...pointers.current.values()];
    if (Math.hypot(p.x - g.start.x, p.y - g.start.y) > 4) g.moved = true;
    if (next.length > 1) {
      const mid = (a: Point[]) => ({
        x: (a[0].x + a[1].x) / 2,
        y: (a[0].y + a[1].y) / 2,
      });
      const dist = (a: Point[]) => Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
      const a = mid(old),
        b = mid(next),
        d = dist(old);
      if (d > 0) zoom(dist(next) / d, a);
      update({
        ...current.current,
        x: current.current.x + b.x - a.x,
        y: current.current.y + b.y - a.y,
      });
      g.multi = true;
    } else if (g.node && mode === 'move' && !g.multi) {
      if (g.moved) {
        const nextNode = {
          ...g.node,
          ...clamp({
            x: g.node.x + (p.x - g.start.x) / current.current.scale,
            y: g.node.y + (p.y - g.start.y) / current.current.scale,
          }),
        };
        draftRef.current = nextNode;
        setDraft(nextNode);
      }
    } else if (!g.node && !g.edge) {
      update({
        ...current.current,
        x: current.current.x + p.x - old[0].x,
        y: current.current.y + p.y - old[0].y,
      });
    }
    g.last = p;
  }
  function end(e: React.PointerEvent, cancel = false) {
    pointers.current.delete(e.pointerId);
    const g = gesture.current;
    if (pointers.current.size) return;
    if (g && !cancel && !g.multi) {
      if (draftRef.current && g.node) onMove(g.node.id, draftRef.current);
      else if (!g.moved) {
        if (g.node) onSelect(g.node.id);
        else if (g.edge) onSelectEdge(g.edge);
        else if (mode === 'add') {
          const p = mapPoint(pointAt(e));
          if (
            p.x >= 0 &&
            p.x <= mapView.width &&
            p.y >= mapView.content.y &&
            p.y <= mapView.height
          )
            onAdd(clamp(p));
        }
      }
    }
    gesture.current = null;
    draftRef.current = null;
    setDraft(null);
    setDragging(false);
  }
  const projected = (n: Point) => ({
    x: camera.x + n.x * camera.scale,
    y: camera.y + n.y * camera.scale,
  });
  const rendered = graph.nodes.map((n) => (draft?.id === n.id ? draft : n)),
    lookup = new Map(rendered.map((n) => [n.id, n]));
  const route = new Set(routeEdges);
  const routeNodes = new Set(
    graph.edges
      .filter((edge) => route.has(edge.id))
      .flatMap((edge) => [edge.from, edge.to]),
  );
  const visibleEdges = presentation
    ? graph.edges.filter((edge) => route.has(edge.id))
    : graph.edges;
  const visibleNodes = presentation
    ? rendered.filter(
        (node) =>
          node.kind === 'destination' ||
          node.kind === 'entrance' ||
          node.kind === 'stairs',
      )
    : rendered;
  return (
    <div className={`canvas-shell${presentation ? ' public-map' : ''}`}>
      <div
        ref={surface}
        className={`map-surface mode-${mode}${dragging ? ' dragging' : ''}`}
        tabIndex={0}
        role="region"
        aria-label={
          presentation
            ? `Mapa de ${mapView.ariaLabel} com rota`
            : `Planta editável de ${mapView.ariaLabel}`
        }
        data-testid="map-surface"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={(e) => end(e)}
        onPointerCancel={(e) => end(e, true)}
        onLostPointerCapture={(e) => {
          if (pointers.current.has(e.pointerId)) end(e, true);
        }}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === '+' || e.key === '=') zoom(1.3);
          else if (e.key === '-') zoom(1 / 1.3);
          else if (e.key === '0' || e.key === 'Home') fit();
          else if (e.key.startsWith('Arrow')) {
            const c = current.current;
            update({
              ...c,
              x:
                c.x +
                (e.key === 'ArrowLeft' ? 60 : e.key === 'ArrowRight' ? -60 : 0),
              y:
                c.y +
                (e.key === 'ArrowUp' ? 60 : e.key === 'ArrowDown' ? -60 : 0),
            });
          } else return;
          e.preventDefault();
        }}
      >
        <img
          ref={image}
          className="floorplan"
          src={`${presentation && mapView.publicImage ? mapView.publicImage : mapView.editorImage}${retry ? '?retry=' + retry : ''}`}
          width={mapView.width}
          height={mapView.height}
          alt={mapView.alt}
          draggable={false}
          onLoad={() => {
            setReady(true);
            setFailed(false);
          }}
          onError={() => {
            setReady(false);
            setFailed(true);
          }}
          style={{
            transform: `translate(${camera.x}px,${camera.y}px) scale(${camera.scale})`,
            visibility: ready ? 'visible' : 'hidden',
          }}
        />
        {ready && (
          <>
            <svg className="connections" aria-label="Conexões entre os pontos">
              {visibleEdges.map((e) => {
                const from = lookup.get(e.from),
                  to = lookup.get(e.to);
                if (!from || !to) return null;
                const a = projected(from),
                  b = projected(to);
                const path = orthogonalPath(a, b);
                return (
                  <g key={e.id}>
                    <path
                      d={path}
                      className={`edge${route.has(e.id) ? ' route' : ''}${selectedEdge === e.id ? ' selected' : ''}`}
                    />
                    {!presentation && (
                      <path d={path} data-edge={e.id} className="edge-hit" />
                    )}
                  </g>
                );
              })}
            </svg>
            {visibleNodes.map((n, i) => {
              const p = projected(n);
              const publicLabel =
                n.kind === 'entrance'
                  ? 'Entrada / Pátio'
                  : n.elementId === 'escadas-bloco-a-salas'
                    ? 'Suba aqui · Bloco A'
                    : n.elementId === 'escada-acesso-bloco-b'
                      ? 'Escada · Bloco B'
                      : n.label
                          .replace(' Bloco A', '')
                          .replace(/ · Bloco B · [12]º andar$/, '');
              return (
                <button
                  key={n.id}
                  data-point={n.id}
                  className={`map-point kind-${n.kind}${selected === n.id ? ' selected' : ''}${routeNodes.has(n.id) ? ' route-node' : ''}${connectionFrom === n.id ? ' linking' : ''}`}
                  style={{ left: p.x, top: p.y }}
                  aria-label={`${n.label}, ponto ${i + 1}`}
                  title={n.label}
                  onClick={(e) => {
                    if (e.detail === 0) onSelect(n.id);
                  }}
                  onKeyDown={(e) => {
                    if (mode === 'move' && e.key.startsWith('Arrow')) {
                      e.preventDefault();
                      e.stopPropagation();
                      const step = (e.shiftKey ? 30 : 10) / camera.scale;
                      onMove(
                        n.id,
                        clamp({
                          x:
                            n.x +
                            (e.key === 'ArrowLeft'
                              ? -step
                              : e.key === 'ArrowRight'
                                ? step
                                : 0),
                          y:
                            n.y +
                            (e.key === 'ArrowUp'
                              ? -step
                              : e.key === 'ArrowDown'
                                ? step
                                : 0),
                        }),
                      );
                    } else if (e.key === 'Delete') {
                      e.preventDefault();
                      onDelete(n.id);
                    }
                  }}
                >
                  <span className="point-number">{i + 1}</span>
                  {(presentation ||
                    selected === n.id ||
                    connectionFrom === n.id) && (
                    <span
                      className={`point-caption${presentation ? (n.x < mapView.width / 2 ? ' label-right' : ' label-left') : ''}`}
                    >
                      {presentation ? publicLabel : n.label}
                    </span>
                  )}
                </button>
              );
            })}
          </>
        )}
        {(!ready || failed) && (
          <div className="map-status" role="status">
            {failed ? (
              <>
                <p>Não foi possível abrir a planta.</p>
                <button
                  className="btn"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => {
                    setFailed(false);
                    setRetry((n) => n + 1);
                  }}
                >
                  <RotateCcw size={16} />
                  Tentar novamente
                </button>
              </>
            ) : (
              'Carregando planta…'
            )}
          </div>
        )}
      </div>
      <div className="canvas-note">
        <span className="live-dot" /> Coordenadas originais preservadas
      </div>
      <div className="zoom-controls">
        <button onClick={() => zoom(1 / 1.3)} aria-label="Diminuir zoom">
          <Minus size={18} />
        </button>
        <output aria-label="Nível de zoom">
          {Math.round((camera.scale / fitScaleValue) * 100)}%
        </output>
        <button onClick={() => zoom(1.3)} aria-label="Aumentar zoom">
          <Plus size={18} />
        </button>
        <span />
        <button onClick={fit} aria-label="Ajustar mapa">
          <Maximize size={18} />
        </button>
      </div>
    </div>
  );
});
