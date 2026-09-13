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
  MoveDown,
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
import blocoB1Data from '@/lib/bloco-b-andar-1-pontos.json';
import blocoB2Data from '@/lib/bloco-b-andar-2-pontos.json';
import patioData from '@/lib/patio-biblioteca-auditorio-pontos.json';
import {
  BLOCO_B_ANDAR_1_ELEMENTS,
  BLOCO_B_ANDAR_1_MAP,
  BLOCO_B_ANDAR_2_ELEMENTS,
  BLOCO_B_ANDAR_2_MAP,
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
const blocoB1 = parseGraph(
  blocoB1Data,
  BLOCO_B_ANDAR_1_MAP,
  BLOCO_B_ANDAR_1_ELEMENTS,
);
const blocoB2 = parseGraph(
  blocoB2Data,
  BLOCO_B_ANDAR_2_MAP,
  BLOCO_B_ANDAR_2_ELEMENTS,
);
const blocoAStairsPortal = MAP_PORTALS.find(
  (portal) => portal.id === 'escada-patio-bloco-a-salas',
)!;
const blocoBStairsPortal = MAP_PORTALS.find(
  (portal) => portal.id === 'escada-patio-bloco-b-andar-2',
)!;
const blocoBFloorsPortal = MAP_PORTALS.find(
  (portal) => portal.id === 'escada-bloco-b-andar-2-andar-1',
)!;
const seedProjects = projectsData as FairProject[];
type MapKey = 'patio' | 'bloco-a-salas' | 'bloco-b-andar-2' | 'bloco-b-andar-1';
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
    editorImage: '/mapas/patio-biblioteca-auditorio-v3-clean.svg',
    publicImage: '/mapas/patio-biblioteca-auditorio-v3-clean.svg',
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
  'bloco-b-andar-2': {
    width: BLOCO_B_ANDAR_2_MAP.width,
    height: BLOCO_B_ANDAR_2_MAP.height,
    content: {
      x: 0,
      y: 0,
      width: BLOCO_B_ANDAR_2_MAP.width,
      height: BLOCO_B_ANDAR_2_MAP.height,
    },
    editorImage: '/mapas/bloco-b-andar-2-clean.svg',
    publicImage: '/mapas/bloco-b-andar-2-clean.svg',
    alt: 'Segundo andar do Bloco B com laboratórios, banheiros e escadas',
    ariaLabel: 'Segundo andar do Bloco B',
  },
  'bloco-b-andar-1': {
    width: BLOCO_B_ANDAR_1_MAP.width,
    height: BLOCO_B_ANDAR_1_MAP.height,
    content: {
      x: 0,
      y: 0,
      width: BLOCO_B_ANDAR_1_MAP.width,
      height: BLOCO_B_ANDAR_1_MAP.height,
    },
    editorImage: '/mapas/bloco-b-andar-1-clean.svg',
    publicImage: '/mapas/bloco-b-andar-1-clean.svg',
    alt: 'Primeiro andar do Bloco B com salas, banheiros, saída e escadas',
    ariaLabel: 'Primeiro andar do Bloco B',
  },
};
const mapNames: Record<MapKey, string> = {
  patio: 'Pátio · Biblioteca · Auditório',
  'bloco-a-salas': 'Bloco A · Salas',
  'bloco-b-andar-2': 'Bloco B · 2º andar',
  'bloco-b-andar-1': 'Bloco B · 1º andar',
};
const roomNumber = (label: string) => Number(label.match(/\d+/)?.[0] ?? 999);

export default function VisitorMap() {
  const canvas = useRef<CanvasHandle>(null);
  const entrance = patio.nodes.find((p) => p.elementId === 'entrada-principal');
  const patioAccessA = resolvePortalPoint(patio, blocoAStairsPortal.from);
  const blocoAEntrance = resolvePortalPoint(blocoA, blocoAStairsPortal.to);
  const patioAccessB = resolvePortalPoint(patio, blocoBStairsPortal.from);
  const blocoBEntrance = resolvePortalPoint(blocoB2, blocoBStairsPortal.to);
  const blocoB2AccessB1 = resolvePortalPoint(blocoB2, blocoBFloorsPortal.from);
  const blocoB1Entrance = resolvePortalPoint(blocoB1, blocoBFloorsPortal.to);
  const rooms = useMemo(
    () =>
      blocoA.nodes
        .filter((p) => p.kind === 'destination')
        .sort((a, b) => roomNumber(a.label) - roomNumber(b.label)),
    [],
  );
  const blocoBRooms = useMemo(
    () => blocoB2.nodes.filter((p) => p.kind === 'destination'),
    [],
  );
  const blocoB1Rooms = useMemo(
    () => blocoB1.nodes.filter((p) => p.kind === 'destination'),
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
          ].includes(p.elementId ?? ''),
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
      ...blocoBRooms.map((p) => ({
        key: `bloco-b-andar-2:${p.id}`,
        mapId: 'bloco-b-andar-2' as const,
        nodeId: p.id,
        label: p.label,
      })),
      ...blocoB1Rooms.map((p) => ({
        key: `bloco-b-andar-1:${p.id}`,
        mapId: 'bloco-b-andar-1' as const,
        nodeId: p.id,
        label: p.label,
      })),
    ],
    [rooms, blocoBRooms, blocoB1Rooms],
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
  const selectedPortalPoint =
    selectedDestination?.mapId === 'bloco-a-salas'
      ? patioAccessA
      : selectedDestination?.mapId === 'bloco-b-andar-2' ||
          selectedDestination?.mapId === 'bloco-b-andar-1'
        ? patioAccessB
        : undefined;
  const patioLeg =
    showRoute && entrance && selectedDestination
      ? shortestPath(
          patio,
          entrance.id,
          selectedDestination.mapId === 'patio'
            ? selectedDestination.nodeId
            : (selectedPortalPoint?.id ?? ''),
        )
      : null;
  const blocoALeg =
    showRoute &&
    selectedDestination?.mapId === 'bloco-a-salas' &&
    blocoAEntrance
      ? shortestPath(blocoA, blocoAEntrance.id, selectedDestination.nodeId)
      : null;
  const blocoB2Leg =
    showRoute &&
    selectedDestination?.mapId === 'bloco-b-andar-2' &&
    blocoBEntrance
      ? shortestPath(blocoB2, blocoBEntrance.id, selectedDestination.nodeId)
      : null;
  const blocoB2TransitLeg =
    showRoute &&
    selectedDestination?.mapId === 'bloco-b-andar-1' &&
    blocoBEntrance &&
    blocoB2AccessB1
      ? shortestPath(blocoB2, blocoBEntrance.id, blocoB2AccessB1.id)
      : null;
  const blocoB1Leg =
    showRoute &&
    selectedDestination?.mapId === 'bloco-b-andar-1' &&
    blocoB1Entrance
      ? shortestPath(blocoB1, blocoB1Entrance.id, selectedDestination.nodeId)
      : null;
  const floorLeg =
    selectedDestination?.mapId === 'bloco-a-salas'
      ? blocoALeg
      : selectedDestination?.mapId === 'bloco-b-andar-2'
        ? blocoB2Leg
        : selectedDestination?.mapId === 'bloco-b-andar-1'
          ? blocoB1Leg
          : null;
  const routeReady =
    selectedDestination?.mapId === 'patio'
      ? !!patioLeg
      : selectedDestination?.mapId === 'bloco-b-andar-1'
        ? !!patioLeg && !!blocoB2TransitLeg && !!blocoB1Leg
        : !!patioLeg && !!floorLeg;
  const graphs = {
    patio,
    'bloco-a-salas': blocoA,
    'bloco-b-andar-2': blocoB2,
    'bloco-b-andar-1': blocoB1,
  };
  const activeGraph = graphs[activeMap];
  const activeLeg =
    activeMap === 'patio'
      ? patioLeg
      : activeMap === 'bloco-a-salas'
        ? blocoALeg
        : activeMap === 'bloco-b-andar-2'
          ? selectedDestination?.mapId === 'bloco-b-andar-1'
            ? blocoB2TransitLeg
            : blocoB2Leg
          : blocoB1Leg;
  const guidedFloorRoute =
    showRoute && selectedDestination?.mapId !== 'patio' && routeReady;

  function chooseDestination(key: string) {
    const destination = destinations.find((d) => d.key === key);
    setSelectedProjectId(null);
    setDestinationKey(key);
    setShowRoute(false);
    if (destination) {
      setActiveMap(destination.mapId);
      const g = graphs[destination.mapId];
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

  function confirmFloorChange() {
    if (!selectedDestination || selectedDestination.mapId === 'patio') return;
    if (selectedDestination.mapId === 'bloco-b-andar-1') {
      setActiveMap(
        activeMap === 'patio' ? 'bloco-b-andar-2' : 'bloco-b-andar-1',
      );
      return;
    }
    setActiveMap(selectedDestination.mapId);
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
          <span>{mapNames[activeMap]}</span>
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
                    : selectedDestination.mapId === 'bloco-b-andar-2'
                      ? activeMap === 'patio'
                        ? 'Passe pelo corredor da biblioteca e do auditório até a escada do Bloco B. Ao descer, confirme no botão acima do mapa.'
                        : 'Você está no 2º andar do Bloco B. Continue pela linha até o laboratório ou ambiente escolhido.'
                      : selectedDestination.mapId === 'bloco-b-andar-1'
                        ? activeMap === 'patio'
                          ? 'Passe pelo corredor da biblioteca e do auditório até a escada do Bloco B. Ao descer, confirme no botão acima do mapa.'
                          : activeMap === 'bloco-b-andar-2'
                            ? 'Você chegou ao 2º andar do Bloco B. Desça mais um lance da escada e confirme para abrir o 1º andar.'
                            : 'Você está no 1º andar do Bloco B. Continue pela linha até a sala ou ambiente escolhido.'
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
              <strong>{mapNames[activeMap]}</strong>
            </div>
            {showRoute && selectedDestination?.mapId !== 'patio' ? (
              <span>
                Rota em{' '}
                {selectedDestination?.mapId === 'bloco-b-andar-1' ? 3 : 2}{' '}
                partes
              </span>
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
            {guidedFloorRoute ? (
              <>
                {activeMap === 'patio' ? (
                  <button
                    className="route-stage-action"
                    onClick={confirmFloorChange}
                  >
                    {selectedDestination?.mapId === 'bloco-a-salas' ? (
                      <MoveUp size={16} />
                    ) : (
                      <MoveDown size={16} />
                    )}
                    {selectedDestination?.mapId === 'bloco-a-salas'
                      ? 'Já subi a escada'
                      : 'Já desci a escada'}
                  </button>
                ) : activeMap === 'bloco-b-andar-2' &&
                  selectedDestination?.mapId === 'bloco-b-andar-1' ? (
                  <>
                    <button className="active">
                      <b>2</b> Bloco B · 2º
                    </button>
                    <button
                      className="route-stage-action"
                      onClick={confirmFloorChange}
                    >
                      <MoveDown size={16} /> Desci para o 1º andar
                    </button>
                  </>
                ) : (
                  <>
                    <button className="active">
                      <b>
                        {selectedDestination?.mapId === 'bloco-b-andar-1'
                          ? 3
                          : 2}
                      </b>{' '}
                      {selectedDestination?.mapId === 'bloco-a-salas'
                        ? 'Bloco A'
                        : selectedDestination?.mapId === 'bloco-b-andar-1'
                          ? 'Bloco B · 1º'
                          : 'Bloco B · 2º'}
                    </button>
                    <button
                      className="route-stage-back"
                      onClick={() =>
                        setActiveMap(
                          selectedDestination?.mapId === 'bloco-b-andar-1'
                            ? 'bloco-b-andar-2'
                            : 'patio',
                        )
                      }
                    >
                      <ArrowLeft size={14} />{' '}
                      {selectedDestination?.mapId === 'bloco-b-andar-1'
                        ? 'Voltar ao 2º andar'
                        : 'Voltar ao pátio'}
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <button
                  className={activeMap === 'bloco-a-salas' ? 'active' : ''}
                  onClick={() => setActiveMap('bloco-a-salas')}
                  disabled={showRoute}
                >
                  <b>2</b> Bloco A
                </button>
                <button
                  className={activeMap === 'bloco-b-andar-2' ? 'active' : ''}
                  onClick={() => setActiveMap('bloco-b-andar-2')}
                  disabled={showRoute}
                >
                  <b>2</b> Bloco B
                </button>
                <button
                  className={activeMap === 'bloco-b-andar-1' ? 'active' : ''}
                  onClick={() => setActiveMap('bloco-b-andar-1')}
                  disabled={showRoute}
                >
                  <b>3</b> Bloco B · 1º
                </button>
              </>
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
