'use client';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Plus, Minus, Maximize, RotateCcw } from 'lucide-react';
import { CONTENT, MAP, type Graph, type MapPoint } from '@/lib/graph';
export type Mode = 'move' | 'add' | 'connect';
type Point = { x: number; y: number };
type Camera = Point & { scale: number };
export type CanvasHandle = { fit: () => void; focusPoint: (point: MapPoint) => void };
type Props = {
  graph: Graph; mode: Mode; selected: string; selectedEdge: string; connectionFrom: string; routeEdges: string[];
  onAdd: (point: Point) => void; onSelect: (id: string) => void; onSelectEdge: (id: string) => void;
  onMove: (id: string, point: Point) => void; onDelete: (id: string) => void;
};
export const MapCanvas = forwardRef<CanvasHandle, Props>(function MapCanvas({graph,mode,selected,selectedEdge,connectionFrom,routeEdges,onAdd,onSelect,onSelectEdge,onMove,onDelete}, ref) {
  const surface = useRef<HTMLDivElement>(null), image = useRef<HTMLImageElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<{start:Point; last:Point; node?:MapPoint; edge?:string; moved:boolean; multi:boolean} | null>(null);
  const current = useRef<Camera>({x:0,y:0,scale:.02});
  const fitScale = useRef(.02);
  const [camera,setCamera]=useState(current.current), [draft,setDraft]=useState<MapPoint|null>(null);
  const draftRef=useRef<MapPoint|null>(null);
  const [ready,setReady]=useState(false), [failed,setFailed]=useState(false), [retry,setRetry]=useState(0);
  const [dragging,setDragging]=useState(false);
  const update=useCallback((c:Camera)=>{current.current=c;setCamera(c)},[]);
  const fit=useCallback(()=>{
    const el=surface.current;if(!el)return;
    const scale=Math.max(.0001,Math.min((el.clientWidth-64)/CONTENT.width,(el.clientHeight-72)/CONTENT.height));
    fitScale.current=scale;
    update({scale,x:(el.clientWidth-CONTENT.width*scale)/2-CONTENT.x*scale,y:(el.clientHeight-CONTENT.height*scale)/2-CONTENT.y*scale});
  },[update]);
  const zoom=useCallback((factor:number,anchor?:Point)=>{
    const el=surface.current;if(!el)return;
    const c=current.current,p=anchor??{x:el.clientWidth/2,y:el.clientHeight/2};
    const scale=Math.max(fitScale.current*.6,Math.min(fitScale.current*32,c.scale*factor)),r=scale/c.scale;
    update({scale,x:p.x-(p.x-c.x)*r,y:p.y-(p.y-c.y)*r});
  },[update]);
  useImperativeHandle(ref,()=>({fit,focusPoint:(p)=>{
    const el=surface.current;if(!el)return;const scale=Math.max(current.current.scale,fitScale.current*3);
    update({scale,x:el.clientWidth/2-p.x*scale,y:el.clientHeight/2-p.y*scale});
  }}),[fit,update]);
  useEffect(()=>{
    const el=surface.current;if(!el)return;
    const observer=new ResizeObserver(fit);observer.observe(el);
    const wheel=(e:WheelEvent)=>{e.preventDefault();const r=el.getBoundingClientRect();zoom(Math.exp(-e.deltaY*.0015),{x:e.clientX-r.left,y:e.clientY-r.top})};
    el.addEventListener('wheel',wheel,{passive:false});return()=>{observer.disconnect();el.removeEventListener('wheel',wheel)};
  },[fit,zoom]);
  useEffect(()=>{
    const img=image.current;
    if(img?.complete){setReady(img.naturalWidth>0);setFailed(img.naturalWidth===0)}
  },[retry]);
  useEffect(()=>{pointers.current.clear();gesture.current=null;setDraft(null);draftRef.current=null;setDragging(false)},[mode]);
  const pointAt=(e:React.PointerEvent)=>{const r=surface.current!.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
  const mapPoint=(p:Point)=>({x:(p.x-current.current.x)/current.current.scale,y:(p.y-current.current.y)/current.current.scale});
  const clamp=(p:Point)=>({x:Math.round(Math.max(0,Math.min(MAP.width,p.x))*100)/100,y:Math.round(Math.max(0,Math.min(MAP.height,p.y))*100)/100});
  function down(e:React.PointerEvent){
    if(!ready || (e.pointerType==='mouse'&&e.button!==0))return;
    const p=pointAt(e);pointers.current.set(e.pointerId,p);surface.current!.setPointerCapture(e.pointerId);
    if(pointers.current.size>1){if(gesture.current)gesture.current.multi=true;draftRef.current=null;setDraft(null);return}
    const target=e.target as Element;
    const id=target.closest('[data-point]')?.getAttribute('data-point');
    const edge=target.closest('[data-edge]')?.getAttribute('data-edge');
    gesture.current={start:p,last:p,node:graph.nodes.find(n=>n.id===id),edge:edge??undefined,moved:false,multi:false};
    setDragging(true);
    if(!id)surface.current!.focus();
  }
  function move(e:React.PointerEvent){
    const g=gesture.current;if(!g||!pointers.current.has(e.pointerId))return;
    const old=[...pointers.current.values()],p=pointAt(e);pointers.current.set(e.pointerId,p);
    const next=[...pointers.current.values()];
    if(Math.hypot(p.x-g.start.x,p.y-g.start.y)>4)g.moved=true;
    if(next.length>1){
      const mid=(a:Point[])=>({x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2});
      const dist=(a:Point[])=>Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);
      const a=mid(old),b=mid(next),d=dist(old);if(d>0)zoom(dist(next)/d,a);
      update({...current.current,x:current.current.x+b.x-a.x,y:current.current.y+b.y-a.y});g.multi=true;
    }else if(g.node&&mode==='move'&&!g.multi){
      if(g.moved){const nextNode={...g.node,...clamp({x:g.node.x+(p.x-g.start.x)/current.current.scale,y:g.node.y+(p.y-g.start.y)/current.current.scale})};draftRef.current=nextNode;setDraft(nextNode)}
    }else if(!g.node&&!g.edge){update({...current.current,x:current.current.x+p.x-old[0].x,y:current.current.y+p.y-old[0].y})}
    g.last=p;
  }
  function end(e:React.PointerEvent,cancel=false){
    pointers.current.delete(e.pointerId);const g=gesture.current;
    if(pointers.current.size)return;
    if(g&&!cancel&&!g.multi){
      if(draftRef.current&&g.node)onMove(g.node.id,draftRef.current);
      else if(!g.moved){if(g.node)onSelect(g.node.id);else if(g.edge)onSelectEdge(g.edge);else if(mode==='add'){const p=mapPoint(pointAt(e));if(p.x>=0&&p.x<=MAP.width&&p.y>=CONTENT.y&&p.y<=MAP.height)onAdd(clamp(p))}}
    }
    gesture.current=null;draftRef.current=null;setDraft(null);setDragging(false);
  }
  const projected=(n:Point)=>({x:camera.x+n.x*camera.scale,y:camera.y+n.y*camera.scale});
  const rendered=graph.nodes.map(n=>draft?.id===n.id?draft:n),lookup=new Map(rendered.map(n=>[n.id,n]));
  const route=new Set(routeEdges);
  return <div className="canvas-shell">
    <div ref={surface} className={`map-surface mode-${mode}${dragging?' dragging':''}`} tabIndex={0} role="region" aria-label="Planta editável do Bloco A" data-testid="map-surface"
      onPointerDown={down} onPointerMove={move} onPointerUp={e=>end(e)} onPointerCancel={e=>end(e,true)} onLostPointerCapture={e=>{if(pointers.current.has(e.pointerId))end(e,true)}}
      onKeyDown={e=>{
        if(e.target!==e.currentTarget)return;
        if(e.key==='+'||e.key==='=')zoom(1.3);else if(e.key==='-')zoom(1/1.3);else if(e.key==='0'||e.key==='Home')fit();
        else if(e.key.startsWith('Arrow')){const c=current.current;update({...c,x:c.x+(e.key==='ArrowLeft'?60:e.key==='ArrowRight'?-60:0),y:c.y+(e.key==='ArrowUp'?60:e.key==='ArrowDown'?-60:0)})}else return;e.preventDefault();
      }}>
      <img ref={image} className="floorplan" src={`/mapas/bloco-a-salas-visual.svg${retry?'?retry='+retry:''}`} width={MAP.width} height={MAP.height} alt="Planta do Bloco A: salas, corredores, portas, pátio e escadas" draggable={false}
        onLoad={()=>{setReady(true);setFailed(false)}} onError={()=>{setReady(false);setFailed(true)}} style={{transform:`translate(${camera.x}px,${camera.y}px) scale(${camera.scale})`,visibility:ready?'visible':'hidden'}}/>
      {ready&&<><svg className="connections" aria-label="Conexões entre os pontos">
        {graph.edges.map(e=>{const from=lookup.get(e.from),to=lookup.get(e.to);if(!from||!to)return null;const a=projected(from),b=projected(to);return <g key={e.id}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={`edge${route.has(e.id)?' route':''}${selectedEdge===e.id?' selected':''}`}/><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} data-edge={e.id} className="edge-hit"/></g>})}
      </svg>{rendered.map((n,i)=>{const p=projected(n);return <button key={n.id} data-point={n.id} className={`map-point kind-${n.kind}${selected===n.id?' selected':''}${connectionFrom===n.id?' linking':''}`} style={{left:p.x,top:p.y}} aria-label={`${n.label}, ponto ${i+1}`} title={n.label}
        onClick={e=>{if(e.detail===0)onSelect(n.id)}} onKeyDown={e=>{if(mode==='move'&&e.key.startsWith('Arrow')){e.preventDefault();e.stopPropagation();const step=(e.shiftKey?30:10)/camera.scale;onMove(n.id,clamp({x:n.x+(e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0),y:n.y+(e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0)}))}else if(e.key==='Delete'){e.preventDefault();onDelete(n.id)}}}>
        <span className="point-number">{i+1}</span>{(selected===n.id||connectionFrom===n.id)&&<span className="point-caption">{n.label}</span>}
      </button>})}</>}
      {(!ready||failed)&&<div className="map-status" role="status">{failed?<><p>Não foi possível abrir a planta.</p><button className="btn" onPointerDown={e=>e.stopPropagation()} onClick={()=>{setFailed(false);setRetry(n=>n+1)}}><RotateCcw size={16}/>Tentar novamente</button></>:'Carregando planta…'}</div>}
    </div>
    <div className="canvas-note"><span className="live-dot"/> Coordenadas originais preservadas</div>
    <div className="zoom-controls"><button onClick={()=>zoom(1/1.3)} aria-label="Diminuir zoom"><Minus size={18}/></button><output aria-label="Nível de zoom">{Math.round(camera.scale/fitScale.current*100)}%</output><button onClick={()=>zoom(1.3)} aria-label="Aumentar zoom"><Plus size={18}/></button><span/><button onClick={fit} aria-label="Ajustar mapa"><Maximize size={18}/></button></div>
  </div>;
});
