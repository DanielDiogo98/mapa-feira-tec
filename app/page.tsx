'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ArrowLeft,
  Map as MapIcon,
  MapPin,
  Navigation,
  Route,
  RotateCcw,
  Search,
  MoveUp,
} from 'lucide-react';
import {
  MapCanvas,
  type CanvasHandle,
  type MapView,
} from '@/components/map-canvas';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import blocoAData from '@/lib/bloco-a-salas-pontos.json';
import patioData from '@/lib/patio-biblioteca-auditorio-pontos.json';
import {
  CONTENT,
  MAP,
  PATIO_ELEMENTS,
  PATIO_MAP,
  parseGraph,
  shortestPath,
} from '@/lib/graph';
import projectsData from '@/lib/projects-data.json';
import {
  filterProjects,
  projectFilterOptions,
  type FairProject,
} from '@/lib/projects';
import { loadProjects } from '@/lib/projects-client';
import { MAP_PORTALS, resolvePortalPoint } from '@/lib/map-portals';

const blocoA = parseGraph(blocoAData);
const patio = parseGraph(patioData, PATIO_MAP, PATIO_ELEMENTS);
const blocoAStairsPortal = MAP_PORTALS.find(
  (portal) => portal.id === 'escada-patio-bloco-a-salas',
)!;
const seedProjects = projectsData as FairProject[];
type MapKey = 'patio' | 'bloco-a-salas';
type Destination = {
  key: string;
  mapId: MapKey;
  nodeId: string;
  label: string;
};
const views: Record<MapKey, MapView> = {
  patio: {
    width: PATIO_MAP.width,
    height: PATIO_MAP.height,
    content: { x: 0, y: 0, width: PATIO_MAP.width, height: PATIO_MAP.height },
    editorImage: '/mapas/patio-biblioteca-auditorio-v2-clean.svg',
    alt: 'Pátio, corredor, biblioteca, auditório e acesso ao Bloco B',
    ariaLabel: 'Pátio, biblioteca e auditório',
  },
  'bloco-a-salas': {
    width: MAP.width,
    height: MAP.height,
    content: CONTENT,
    editorImage: '/mapas/bloco-a-salas-clean.svg',
    publicImage: '/mapas/bloco-a-salas-clean.svg',
    alt: 'Planta do Bloco A com salas, portas e corredores',
    ariaLabel: 'Bloco A',
  },
};
const roomNumber = (label: string) => Number(label.match(/\d+/)?.[0] ?? 999);

export default function VisitorMap() {
  const canvas = useRef<CanvasHandle>(null);
  const entrance = patio.nodes.find((p) => p.elementId === 'entrada-principal');
  const patioAccessA = resolvePortalPoint(patio, blocoAStairsPortal.from);
  const blocoAEntrance = resolvePortalPoint(blocoA, blocoAStairsPortal.to);
  const rooms = useMemo(
    () =>
      blocoA.nodes
        .filter((p) => p.kind === 'destination')
        .sort((a, b) => roomNumber(a.label) - roomNumber(b.label)),
    [],
  );
  const destinations = useMemo<Destination[]>(
    () => [
      ...patio.nodes
        .filter((p) =>
          [
            'cantina',
            'refeitorio',
            'biblioteca',
            'auditorio',
            'elevador',
            'escada-acesso-bloco-b',
            'banheiro-masculino',
            'banheiro-feminino',
          ].includes(
            p.elementId ?? '',
          ),
        )
        .map((p) => ({
          key: `patio:${p.id}`,
          mapId: 'patio' as const,
          nodeId: p.id,
          label: p.label,
        })),
      ...rooms.map((p) => ({
        key: `bloco-a-salas:${p.id}`,
        mapId: 'bloco-a-salas' as const,
        nodeId: p.id,
        label: p.label,
      })),
    ],
    [rooms],
  );
  const [destinationKey, setDestinationKey] = useState('');
  const [activeMap, setActiveMap] = useState<MapKey>('patio');
  const [showRoute, setShowRoute] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );
  const [query, setQuery] = useState('');
  const [course, setCourse] = useState('');
  const [series, setSeries] = useState('');
  const [shift, setShift] = useState('');
  const [stand, setStand] = useState('');
  const [ods, setOds] = useState('');
  const [projects, setProjects] = useState(seedProjects);
  useEffect(() => {
    let active = true;
    void loadProjects(seedProjects).then((data) => {
      if (active) setProjects(data);
    });
    return () => {
      active = false;
    };
  }, []);
  const filterOptions = useMemo(
    () => projectFilterOptions(projects),
    [projects],
  );
  const filteredProjects = useMemo(
    () =>
      filterProjects(projects, { query, course, series, shift, stand, ods }),
    [projects, query, course, series, shift, stand, ods],
  );
  const selectedDestination = destinations.find(
    (d) => d.key === destinationKey,
  );
  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const patioLeg =
    showRoute && entrance && selectedDestination
      ? shortestPath(
          patio,
          entrance.id,
          selectedDestination.mapId === 'patio'
            ? selectedDestination.nodeId
            : (patioAccessA?.id ?? ''),
        )
      : null;
  const blocoALeg =
    showRoute &&
    selectedDestination?.mapId === 'bloco-a-salas' &&
    blocoAEntrance
      ? shortestPath(blocoA, blocoAEntrance.id, selectedDestination.nodeId)
      : null;
  const routeReady =
    selectedDestination?.mapId === 'patio'
      ? !!patioLeg
      : !!patioLeg && !!blocoALeg;
  const activeGraph = activeMap === 'patio' ? patio : blocoA;
  const activeLeg = activeMap === 'patio' ? patioLeg : blocoALeg;
  const guidedStairRoute =
    showRoute && selectedDestination?.mapId === 'bloco-a-salas' && routeReady;

  function chooseDestination(key: string) {
    const destination = destinations.find((d) => d.key === key);
    setSelectedProjectId(null);
    setDestinationKey(key);
    setShowRoute(false);
    if (destination) {
      setActiveMap(destination.mapId);
      const g = destination.mapId === 'patio' ? patio : blocoA;
      const p = g.nodes.find((n) => n.id === destination.nodeId);
      if (p) queueMicrotask(() => canvas.current?.focusPoint(p));
    }
  }
  function chooseProject(project: FairProject) {
    if (!project.location || project.location.mapId !== 'bloco-a-salas') return;
    const room = rooms.find((p) => p.elementId === project.location?.elementId);
    if (!room) return;
    setSelectedProjectId(project.id);
    setDestinationKey(`bloco-a-salas:${room.id}`);
    setShowRoute(true);
    setActiveMap('patio');
  }
  function calculateRoute() {
    if (selectedDestination && entrance) {
      setShowRoute(true);
      setActiveMap('patio');
    }
  }
  function resetRoute() {
    setDestinationKey('');
    setShowRoute(false);
    setSelectedProjectId(null);
    setActiveMap('patio');
  }

  function confirmStairsClimbed() {
    setActiveMap('bloco-a-salas');
  }

  return (
    <main className="visitor-app">
      <header className="visitor-header">
        <div className="brand">
          <span className="brand-icon">
            <MapIcon size={22} />
          </span>
          <div>
            <strong>Feira Tecnológica</strong>
            <span>Mapa dos projetos</span>
          </div>
        </div>
        <div className="visitor-location">
          <MapPin size={16} />
          <span>
            {activeMap === 'patio'
              ? 'Pátio · Biblioteca · Auditório'
              : 'Bloco A · Salas'}
          </span>
        </div>
      </header>
      <div className="visitor-layout">
        <aside className="visitor-panel">
          <span className="eyebrow">COMO CHEGAR</span>
          <h1>Encontre um projeto</h1>
          <p className="visitor-lead">
            Pesquise pelo projeto, aluno, curso ou série e veja como chegar.
          </p>
          <label htmlFor="project-search">Buscar</label>
          <div className="project-search">
            <Search size={18} />
            <input
              id="project-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nome do projeto ou aluno"
            />
          </div>
          <div className="project-filters" aria-label="Filtros de projetos">
            <NativeSelect
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              aria-label="Filtrar por curso"
            >
              <NativeSelectOption value="">Todos os cursos</NativeSelectOption>
              {filterOptions.courses.map((o) => (
                <NativeSelectOption key={o} value={o}>
                  {o}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            {filterOptions.stands.length > 1 && (
              <NativeSelect
                value={stand}
                onChange={(e) => setStand(e.target.value)}
                aria-label="Filtrar por stand"
              >
                <NativeSelectOption value="">
                  Todos os stands
                </NativeSelectOption>
                {filterOptions.stands.map((number) => (
                  <NativeSelectOption key={number} value={String(number)}>
                    Stand {number}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            )}
            {filterOptions.ods.length > 0 && (
              <NativeSelect
                value={ods}
                onChange={(e) => setOds(e.target.value)}
                aria-label="Filtrar por ODS"
              >
                <NativeSelectOption value="">Todos os ODS</NativeSelectOption>
                {filterOptions.ods.map((item) => (
                  <NativeSelectOption
                    key={item.number}
                    value={String(item.number)}
                  >
                    ODS {item.number} · {item.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            )}
            <NativeSelect
              value={series}
              onChange={(e) => setSeries(e.target.value)}
              aria-label="Filtrar por série"
            >
              <NativeSelectOption value="">Todas as séries</NativeSelectOption>
              {filterOptions.series.map((o) => (
                <NativeSelectOption key={o} value={o}>
                  {o}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <NativeSelect
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              aria-label="Filtrar por turno"
            >
              <NativeSelectOption value="">Todos os turnos</NativeSelectOption>
              {filterOptions.shifts.map((o) => (
                <NativeSelectOption key={o} value={o}>
                  {o}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          <div className="project-results" aria-label="Projetos encontrados">
            {filteredProjects.map((project) => (
              <button
                key={project.id}
                className={selectedProjectId === project.id ? 'selected' : ''}
                disabled={!project.location}
                onClick={() => chooseProject(project)}
              >
                <span>
                  <strong>{project.name}</strong>
                  <small>{project.description}</small>
                  {project.stand && <small>Stand {project.stand}</small>}
                </span>
                <em>{project.location?.label ?? 'Local a confirmar'}</em>
              </button>
            ))}
            {!filteredProjects.length && (
              <p className="no-projects">
                Nenhum projeto encontrado com esses filtros.
              </p>
            )}
          </div>
          <div className="choice-divider">
            <span>OU ESCOLHA UM LOCAL</span>
          </div>
          <div className="origin-card">
            <span className="origin-icon">
              <Navigation size={18} />
            </span>
            <div>
              <small>PONTO DE PARTIDA</small>
              <strong>{entrance?.label ?? 'Entrada da escola'}</strong>
            </div>
          </div>
          <label htmlFor="visitor-destination">Para onde você quer ir?</label>
          <NativeSelect
            id="visitor-destination"
            value={destinationKey}
            onChange={(e) => chooseDestination(e.target.value)}
          >
            <NativeSelectOption value="">Selecione um local</NativeSelectOption>
            {destinations.map((d) => (
              <NativeSelectOption key={d.key} value={d.key}>
                {d.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <button
            className="btn primary visitor-route-button"
            disabled={!selectedDestination || !entrance}
            onClick={calculateRoute}
          >
            <Route size={18} /> Mostrar caminho
          </button>
          {showRoute && routeReady && selectedDestination && (
            <output className="visitor-result">
              <span className="result-check">
                <Check size={18} />
              </span>
              <div>
                <strong>
                  Rota para {selectedProject?.name ?? selectedDestination.label}
                </strong>
                <p>
                  {selectedDestination.mapId === 'bloco-a-salas'
                    ? activeMap === 'patio'
                      ? 'Siga a linha até a escada do Bloco A. Ao subir, confirme no botão acima do mapa.'
                      : 'Você está nas salas do Bloco A. Continue pela linha até o destino.'
                    : 'Siga a linha vermelha a partir da entrada da escola.'}
                </p>
              </div>
            </output>
          )}
          {showRoute && !routeReady && (
            <div className="visitor-result unavailable" role="alert">
              <div>
                <strong>Rota indisponível</strong>
                <p>Esse destino ainda não está conectado à entrada.</p>
              </div>
            </div>
          )}
          {(destinationKey || showRoute) && (
            <button className="reset-route" onClick={resetRoute}>
              <RotateCcw size={15} /> Limpar escolha
            </button>
          )}
          <div className="visitor-help">
            <strong>Dica</strong>
            <p>
              Arraste o mapa ou use <b>+</b> e <b>−</b> para aproximar.
            </p>
          </div>
        </aside>
        <section className="visitor-map-area">
          <div className="visitor-map-bar">
            <div>
              <span className="live-dot" />
              <strong>
                {activeMap === 'patio'
                  ? 'Pátio, biblioteca e auditório'
                  : 'Bloco A'}
              </strong>
            </div>
            {showRoute && selectedDestination?.mapId === 'bloco-a-salas' ? (
              <span>Rota em 2 partes</span>
            ) : (
              <span>{destinations.length} locais disponíveis</span>
            )}
          </div>
          <div className="map-step-switch" aria-label="Trechos do mapa">
            <button
              className={activeMap === 'patio' ? 'active' : ''}
              onClick={() => setActiveMap('patio')}
            >
              <b>1</b> Pátio e auditório
            </button>
            {guidedStairRoute && activeMap === 'patio' ? (
              <button
                className="route-stage-action"
                onClick={confirmStairsClimbed}
              >
                <MoveUp size={16} /> Já subi a escada
              </button>
            ) : (
              <button
                className={activeMap === 'bloco-a-salas' ? 'active' : ''}
                onClick={() => setActiveMap('bloco-a-salas')}
                disabled={!guidedStairRoute && showRoute}
              >
                <b>2</b> Bloco A
              </button>
            )}
            {guidedStairRoute && activeMap === 'bloco-a-salas' ? (
              <button
                className="route-stage-back"
                onClick={() => setActiveMap('patio')}
              >
                <ArrowLeft size={14} /> Voltar ao pátio
              </button>
            ) : (
              <span>Bloco B em preparação</span>
            )}
          </div>
          <MapCanvas
            key={activeMap}
            ref={canvas}
            graph={activeGraph}
            mapView={views[activeMap]}
            mode="move"
            presentation
            selected={
              selectedDestination?.mapId === activeMap
                ? selectedDestination.nodeId
                : ''
            }
            selectedEdge=""
            connectionFrom=""
            routeEdges={activeLeg?.edges ?? []}
            onAdd={() => {}}
            onSelect={(id) => {
              const d = destinations.find(
                (item) => item.mapId === activeMap && item.nodeId === id,
              );
              if (d) chooseDestination(d.key);
            }}
            onSelectEdge={() => {}}
            onMove={() => {}}
            onDelete={() => {}}
          />
          <footer className="visitor-map-footer">
            <span>
              <i className="legend-entry" /> Entrada
            </span>
            <span>
              <i className="legend-room" /> Destinos
            </span>
            <span>
              <i className="legend-stairs" /> Escadas
            </span>
            <span>
              <i className="legend-route" /> Sua rota
            </span>
          </footer>
        </section>
      </div>
    </main>
  );
}
