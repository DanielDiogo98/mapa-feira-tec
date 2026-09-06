'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Map, Plus, Minus, Maximize, Move } from 'lucide-react';

const W = 12861, H = 42113;
type View = { x: number; y: number; scale: number };
type Point = { x: number; y: number };
export default function Home() {
  const surface = useRef<HTMLDivElement>(null);
  const pointers = useRef(new globalThis.Map<number, Point>());
  const current = useRef<View>({ x: 0, y: 0, scale: .01 });
  const base = useRef(.01);
  const [view, setView] = useState(current.current);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [dragging, setDragging] = useState(false);
  const update = useCallback((v: View) => { current.current = v; setView(v); }, []);
  const fit = useCallback(() => {
    const el = surface.current; if (!el) return;
    const scale = Math.min((el.clientWidth - 64) / W, (el.clientHeight - 64) / H);
    base.current = Math.max(scale, .0001);
    update({ x: (el.clientWidth - W * scale) / 2, y: (el.clientHeight - H * scale) / 2, scale });
  }, [update]);
  const zoom = useCallback((factor: number, anchor?: Point) => {
    const el = surface.current; if (!el) return;
    const old = current.current;
    const at = anchor ?? { x: el.clientWidth / 2, y: el.clientHeight / 2 };
    const scale = Math.min(base.current * 24, Math.max(base.current * .5, old.scale * factor));
    const ratio = scale / old.scale;
    update({ scale, x: at.x - (at.x - old.x) * ratio, y: at.y - (at.y - old.y) * ratio });
  }, [update]);
  useEffect(() => {
    const el = surface.current; if (!el) return;
    const observer = new ResizeObserver(fit); observer.observe(el);
    const wheel = (e: WheelEvent) => { e.preventDefault(); const r = el.getBoundingClientRect(); zoom(Math.exp(-e.deltaY * .0015), { x: e.clientX - r.left, y: e.clientY - r.top }); };
    el.addEventListener('wheel', wheel, { passive: false });
    return () => { observer.disconnect(); el.removeEventListener('wheel', wheel); };
  }, [fit, zoom]);
  function position(e: React.PointerEvent): Point { const r = surface.current!.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function move(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId)) return;
    const before = [...pointers.current.values()];
    pointers.current.set(e.pointerId, position(e));
    const after = [...pointers.current.values()];
    if (before.length === 1) update({ ...current.current, x: current.current.x + after[0].x - before[0].x, y: current.current.y + after[0].y - before[0].y });
    else {
      const mid = (p: Point[]) => ({ x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2 });
      const distance = (p: Point[]) => Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      const a = mid(before), b = mid(after), d = distance(before);
      if (d > 0) zoom(distance(after) / d, a);
      update({ ...current.current, x: current.current.x + b.x - a.x, y: current.current.y + b.y - a.y });
    }
  }
  function release(e: React.PointerEvent) { pointers.current.delete(e.pointerId); setDragging(pointers.current.size > 0); }
  return <main className="app">
    <header className="header"><div className="brand"><span className="brand-icon"><Map size={23}/></span><div><strong>Feira Tecnológica</strong><span>Mapa da escola</span></div></div><span className="pilot"><i/> Mapa piloto</span></header>
    <section className="workspace">
      <div className="map-heading"><div><span className="eyebrow">EXPLORE O ESPAÇO</span><h1>Bloco A <span>/ Salas</span></h1></div><p><Move size={16}/> Arraste para explorar</p></div>
      <div className={'surface' + (dragging ? ' dragging' : '')} ref={surface} tabIndex={0} role="region" aria-label="Mapa do Bloco A. Use mais e menos para zoom, setas para mover e zero para ajustar."
        onPointerDown={e => { if (e.pointerType === 'mouse' && e.button !== 0) return; surface.current!.focus(); surface.current!.setPointerCapture(e.pointerId); pointers.current.set(e.pointerId, position(e)); setDragging(true); }}
        onPointerMove={move} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}
        onKeyDown={e => { if (e.key === '+' || e.key === '=') zoom(1.3); else if (e.key === '-') zoom(1 / 1.3); else if (e.key === '0' || e.key === 'Home') fit(); else if (e.key.startsWith('Arrow')) { const v = current.current; update({ ...v, x: v.x + (e.key === 'ArrowLeft' ? 60 : e.key === 'ArrowRight' ? -60 : 0), y: v.y + (e.key === 'ArrowUp' ? 60 : e.key === 'ArrowDown' ? -60 : 0) }); } else return; e.preventDefault(); }}>
        <img className="floorplan" src="/mapas/bloco-a-salas.svg" alt="Planta do Bloco A com salas, corredores, portas, pátio e escadas" draggable={false} width={W} height={H} onLoad={() => setLoaded(true)} onError={() => setError(true)} style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`, visibility: loaded ? 'visible' : 'hidden' }}/>
        {(!loaded || error) && <div className="status" role="status">{error ? 'Não foi possível carregar o mapa. Recarregue a página para tentar novamente.' : 'Carregando mapa…'}</div>}
      </div>
      <div className="toolbar" aria-label="Controles do mapa"><button onClick={() => zoom(1 / 1.3)} aria-label="Diminuir zoom"><Minus size={20}/></button><output aria-label="Nível de zoom">{Math.round(view.scale / base.current * 100)}%</output><button onClick={() => zoom(1.3)} aria-label="Aumentar zoom"><Plus size={20}/></button><span className="separator"/><button className="fit" onClick={fit}><Maximize size={18}/><span>Ajustar mapa</span></button></div>
      <div className="map-label">BLOCO A <span>•</span> SALAS</div>
    </section>
    <footer><div className="legend"><span><i className="room"/>Salas</span><span><i className="corridor"/>Corredores</span><span><i className="door"/>Portas</span><span><i className="stairs"/>Escadas</span></div><p>Use a roda do mouse ou dois dedos para ampliar.</p></footer>
  </main>;
}
