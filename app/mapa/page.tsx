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
  NativeSelectOptGroup,
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
} from '@/lib/graph';
import projectsData from '@/lib/projects-data.json';
import {
  filterProjects,
  projectFilterOptions,
  type FairProject,
} from '@/lib/projects';
import { loadProjects } from '@/lib/projects-client';
import { MAP_PORTALS } from '@/lib/map-portals';
import { planMultiMapRoute } from '@/lib/map-route';

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
const seedProjects = projectsData as FairProject[];
type MapKey =
  | 'patio-biblioteca-auditorio'
  | 'bloco-a-salas'
  | 'bloco-b-andar-2'
  | 'bloco-b-andar-1';
type Destination = {
  key: string;
  mapId: MapKey;
  nodeId: string;
  label: string;
};
type DestinationGroup = {
  mapId: MapKey;
  label: string;
  items: Destination[];
};
const views: Record<MapKey, MapView> = {
  'patio-biblioteca-auditorio': {
    width: PATIO_MAP.width,
    height: PATIO_MAP.height,
    content: { x: 0, y: 0, width: PATIO_MAP.width, height: PATIO_MAP.height },
    editorImage: '/mapas/patio-biblioteca-auditorio-v3-clean.svg',
    publicImage: '/mapas/patio-biblioteca-auditorio-v3-clean.svg',
    alt: 'Pátio da escola com acesso à biblioteca',
    ariaLabel: 'Pátio, biblioteca e acessos',
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
    editorImage: '/mapas/passagem-labs-bloco-a-e-bloco-b-andar-2-clean.svg',
    publicImage: '/mapas/passagem-labs-bloco-a-e-bloco-b-andar-2-clean.svg',
    alt: 'Passagem dos laboratórios do Bloco A conectada ao segundo andar do Bloco B',
    ariaLabel: 'Passagem do Bloco A e segundo andar do Bloco B',
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
  'patio-biblioteca-auditorio': 'Pátio · Biblioteca',
  'bloco-a-salas': 'Bloco A · Salas',
  'bloco-b-andar-2': 'Passagem Bloco A · Bloco B · 2º andar',
  'bloco-b-andar-1': 'Bloco B · 1º andar',
};
const mapShortNames: Record<MapKey, string> = {
  'patio-biblioteca-auditorio': 'Pátio',
  'bloco-a-salas': 'Bloco A',
  'bloco-b-andar-2': 'Passagem A · Bloco B · 2º',
  'bloco-b-andar-1': 'Bloco B · 1º',
};
const mapOrder: MapKey[] = [
  'patio-biblioteca-auditorio',
  'bloco-a-salas',
  'bloco-b-andar-2',
  'bloco-b-andar-1',
];

function transitionInfo(from: MapKey, to: MapKey) {
  const goingUp =
    (from === 'patio-biblioteca-auditorio' && to === 'bloco-a-salas') ||
    (from === 'bloco-b-andar-2' && to === 'patio-biblioteca-auditorio') ||
    (from === 'bloco-b-andar-1' && to === 'bloco-b-andar-2');
  const action = goingUp ? 'Já subi a escada' : 'Já desci a escada';
  const direction = goingUp ? 'Suba' : 'Desça';
  const guidance =
    from === 'bloco-b-andar-2' && to === 'patio-biblioteca-auditorio'
      ? 'Suba a escada no fim da passagem e confirme para abrir o caminho no pátio.'
      : from === 'patio-biblioteca-auditorio' && to === 'bloco-a-salas'
        ? 'Você chegou ao pátio. Continue subindo pela mesma escada e confirme para abrir o caminho das salas do Bloco A.'
        : from === 'bloco-b-andar-2' && to === 'bloco-b-andar-1'
          ? 'Você chegou ao 2º andar do Bloco B. Desça mais um lance da escada e confirme para abrir o caminho no 1º andar.'
          : `Siga a linha até a escada. ${direction} e confirme no botão acima do mapa para continuar a rota.`;
  return {
    goingUp,
    action,
    guidance,
  };
}
const roomNumber = (label: string) => Number(label.match(/\d+/)?.[0] ?? 999);
const normalizeLocation = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();

function filterLocationGroups(
  groups: DestinationGroup[],
  query: string,
  selectedKey: string,
) {
  const term = normalizeLocation(query);
  if (!term) return groups;
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.key === selectedKey ||
          normalizeLocation(item.label).includes(term),
      ),
    }))
    .filter((group) => group.items.length);
}

export default function VisitorMap() {
  const canvas = useRef<CanvasHandle>(null);
  const entrance = patio.nodes.find((p) => p.elementId === 'entrada-principal');
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
        .filter((p) => ['cantina', 'refeitorio'].includes(p.elementId ?? ''))
        .map((p) => ({
          key: `patio-biblioteca-auditorio:${p.id}`,
          mapId: 'patio-biblioteca-auditorio' as const,
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
  const destinationGroups = useMemo<DestinationGroup[]>(
    () =>
      mapOrder.map((mapId) => ({
        mapId,
        label: mapNames[mapId],
        items: destinations.filter(
          (destination) => destination.mapId === mapId,
        ),
      })),
    [destinations],
  );
  const [originKey, setOriginKey] = useState('');
  const [destinationKey, setDestinationKey] = useState('');
  const [originSearch, setOriginSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [activeMap, setActiveMap] = useState<MapKey>(
    'patio-biblioteca-auditorio',
  );
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
  const selectedOrigin = originKey
    ? destinations.find((d) => d.key === originKey)
    : entrance
      ? {
          key: 'entrada-padrao',
          mapId: 'patio-biblioteca-auditorio' as const,
          nodeId: entrance.id,
          label: entrance.label || 'Entrada da escola',
        }
      : undefined;
  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const originGroups = filterLocationGroups(
    destinationGroups,
    originSearch,
    originKey,
  );
  const visibleDestinationGroups = filterLocationGroups(
    destinationGroups,
    destinationSearch,
    destinationKey,
  );
  const graphs = {
    'patio-biblioteca-auditorio': patio,
    'bloco-a-salas': blocoA,
    'bloco-b-andar-2': blocoB2,
    'bloco-b-andar-1': blocoB1,
  };
  const routePlan =
    showRoute && selectedOrigin && selectedDestination
      ? planMultiMapRoute(
          graphs,
          MAP_PORTALS,
          selectedOrigin,
          selectedDestination,
        )
      : null;
  const routeReady = !!routePlan;
  const activeStageIndex =
    routePlan?.findIndex((stage) => stage.mapId === activeMap) ?? -1;
  const activeStage =
    activeStageIndex >= 0 ? routePlan?.[activeStageIndex] : undefined;
  const previousStage =
    activeStageIndex > 0 ? routePlan?.[activeStageIndex - 1] : undefined;
  const nextStage =
    activeStageIndex >= 0 ? routePlan?.[activeStageIndex + 1] : undefined;
  const activeGraph = graphs[activeMap];

  function chooseOrigin(key: string) {
    const origin = key
      ? destinations.find((destination) => destination.key === key)
      : entrance
        ? {
            mapId: 'patio-biblioteca-auditorio' as const,
            nodeId: entrance.id,
          }
        : undefined;
    setOriginKey(key);
    setOriginSearch('');
    setShowRoute(false);
    if (origin) {
      setActiveMap(origin.mapId);
      const point = graphs[origin.mapId].nodes.find(
        (node) => node.id === origin.nodeId,
      );
      if (point) queueMicrotask(() => canvas.current?.focusPoint(point));
    }
  }

  function chooseDestination(key: string) {
    const destination = destinations.find((d) => d.key === key);
    setSelectedProjectId(null);
    setDestinationKey(key);
    setDestinationSearch('');
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
    setActiveMap(selectedOrigin?.mapId ?? 'patio-biblioteca-auditorio');
  }
  function calculateRoute() {
    if (selectedDestination && selectedOrigin) {
      setShowRoute(true);
      setActiveMap(selectedOrigin.mapId);
    }
  }
  function resetRoute() {
    setOriginKey('');
    setDestinationKey('');
    setOriginSearch('');
    setDestinationSearch('');
    setShowRoute(false);
    setSelectedProjectId(null);
    setActiveMap('patio-biblioteca-auditorio');
  }

  function showStage(mapId: string) {
    setActiveMap(mapId as MapKey);
  }

  return (
    <main className="visitor-app">
      <header className="visitor-header">
        <div className="brand">
          <span className="brand-icon">
            <MapIcon size={22} />
          </span>
          <div>
            <strong>Feira Tecnológica 2026</strong>
            <span>Mapa dos projetos · ETEC MCM</span>
          </div>
        </div>
        <div className="visitor-header-actions">
          <a className="visitor-home-link" href="/index.html">
            <ArrowLeft size={17} />
            <span>Voltar ao início</span>
          </a>
          <div className="visitor-location">
            <MapPin size={16} />
            <span>{mapNames[activeMap]}</span>
          </div>
        </div>
      </header>
      <div className="visitor-layout">
        <aside className="visitor-panel">
          <span className="eyebrow">EXPLORE A FEIRA</span>
          <h1>Encontre seu caminho</h1>
          <p className="visitor-lead">
            Busque um projeto ou escolha um local para traçar sua rota pela
            escola.
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
          <div className="route-picker">
            <div className="route-field origin-field">
              <div className="route-field-heading">
                <span className="route-field-icon">
                  <Navigation size={17} />
                </span>
                <label htmlFor="visitor-origin">De onde você está?</label>
                <small>OPCIONAL</small>
              </div>
              <div className="location-search">
                <Search size={15} />
                <input
                  type="search"
                  value={originSearch}
                  onChange={(event) => setOriginSearch(event.target.value)}
                  placeholder="Buscar local de partida"
                  aria-label="Buscar local de partida"
                />
              </div>
              <NativeSelect
                id="visitor-origin"
                value={originKey}
                onChange={(e) => chooseOrigin(e.target.value)}
                aria-describedby="origin-hint"
              >
                <NativeSelectOption value="">
                  Entrada da escola (padrão)
                </NativeSelectOption>
                {originGroups.map((group) => (
                  <NativeSelectOptGroup key={group.mapId} label={group.label}>
                    {group.items.map((destination) => (
                      <NativeSelectOption
                        key={destination.key}
                        value={destination.key}
                      >
                        {destination.label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelectOptGroup>
                ))}
                {originSearch && !originGroups.length && (
                  <NativeSelectOption value="sem-resultado" disabled>
                    Nenhum local encontrado
                  </NativeSelectOption>
                )}
              </NativeSelect>
              <p id="origin-hint">Se não escolher, a rota começa na entrada.</p>
            </div>
            <div className="route-picker-connector" aria-hidden="true">
              <span />
              <MoveDown size={14} />
              <span />
            </div>
            <div className="route-field destination-field">
              <div className="route-field-heading">
                <span className="route-field-icon">
                  <MapPin size={17} />
                </span>
                <label htmlFor="visitor-destination">
                  Para onde você quer ir?
                </label>
                <small>DESTINO</small>
              </div>
              <div className="location-search">
                <Search size={15} />
                <input
                  type="search"
                  value={destinationSearch}
                  onChange={(event) => setDestinationSearch(event.target.value)}
                  placeholder="Buscar destino"
                  aria-label="Buscar destino"
                />
              </div>
              <NativeSelect
                id="visitor-destination"
                value={destinationKey}
                onChange={(e) => chooseDestination(e.target.value)}
              >
                <NativeSelectOption value="">
                  Selecione um local
                </NativeSelectOption>
                {visibleDestinationGroups.map((group) => (
                  <NativeSelectOptGroup key={group.mapId} label={group.label}>
                    {group.items.map((destination) => (
                      <NativeSelectOption
                        key={destination.key}
                        value={destination.key}
                      >
                        {destination.label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelectOptGroup>
                ))}
                {destinationSearch && !visibleDestinationGroups.length && (
                  <NativeSelectOption value="sem-resultado" disabled>
                    Nenhum local encontrado
                  </NativeSelectOption>
                )}
              </NativeSelect>
            </div>
          </div>
          <button
            className="btn primary visitor-route-button"
            disabled={!selectedDestination || !selectedOrigin}
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
                  {nextStage
                    ? transitionInfo(activeMap, nextStage.mapId as MapKey)
                        .guidance
                    : `Você está em ${mapNames[activeMap]}. Continue pela linha destacada até o destino.`}
                </p>
                {routePlan && routePlan.length > 1 && (
                  <div className="route-summary" aria-label="Resumo da rota">
                    {routePlan.map((stage, index) => (
                      <span
                        key={`${stage.mapId}-${index}`}
                        className={stage.mapId === activeMap ? 'current' : ''}
                      >
                        {mapShortNames[stage.mapId as MapKey]}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </output>
          )}
          {showRoute && !routeReady && (
            <div className="visitor-result unavailable" role="alert">
              <div>
                <strong>Rota indisponível</strong>
                <p>Esses dois locais ainda não possuem uma conexão completa.</p>
              </div>
            </div>
          )}
          {(originKey || destinationKey || showRoute) && (
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
            {showRoute && routePlan ? (
              <span>Rota ativa</span>
            ) : (
              <span>{destinations.length} locais disponíveis</span>
            )}
          </div>
          <div className="map-step-switch" aria-label="Trechos do mapa">
            {showRoute && routeReady && routePlan ? (
              <>
                {previousStage && (
                  <button
                    className="route-stage-back"
                    onClick={() => showStage(previousStage.mapId)}
                  >
                    <ArrowLeft size={14} /> Voltar para{' '}
                    {mapShortNames[previousStage.mapId as MapKey]}
                  </button>
                )}
                <button className="active" aria-current="step">
                  <b>{activeStageIndex + 1}</b> {mapShortNames[activeMap]}
                </button>
                {nextStage && (
                  <button
                    className="route-stage-action"
                    onClick={() => showStage(nextStage.mapId)}
                  >
                    {transitionInfo(activeMap, nextStage.mapId as MapKey)
                      .goingUp ? (
                      <MoveUp size={16} />
                    ) : (
                      <MoveDown size={16} />
                    )}
                    {activeMap === 'bloco-b-andar-2' &&
                    nextStage.mapId === 'bloco-b-andar-1'
                      ? 'Desci mais um andar'
                      : transitionInfo(activeMap, nextStage.mapId as MapKey)
                          .action}
                  </button>
                )}
              </>
            ) : (
              mapOrder.map((mapId, index) => (
                <button
                  key={mapId}
                  className={activeMap === mapId ? 'active' : ''}
                  onClick={() => setActiveMap(mapId)}
                  disabled={showRoute}
                >
                  <b>{index + 1}</b> {mapShortNames[mapId]}
                </button>
              ))
            )}
          </div>
          {showRoute &&
            routeReady &&
            activeMap === 'bloco-b-andar-2' &&
            (nextStage?.mapId === 'bloco-b-andar-1' ||
              nextStage?.mapId === 'patio-biblioteca-auditorio' ||
              nextStage?.mapId === 'bloco-a-salas') && (
              <output className="floor-change-alert">
                <span className="floor-change-icon">
                  {nextStage.mapId === 'bloco-b-andar-1' ? (
                    <MoveDown size={24} />
                  ) : (
                    <MoveUp size={24} />
                  )}
                </span>
                <div>
                  <strong>
                    {nextStage.mapId === 'bloco-b-andar-1'
                      ? 'A rota continua no 1º andar'
                      : nextStage.mapId === 'bloco-a-salas'
                        ? 'Continue subindo para chegar às salas do Bloco A'
                        : 'Suba a escada para chegar ao pátio'}
                  </strong>
                  <p>
                    {nextStage.mapId === 'bloco-b-andar-1'
                      ? 'Atravesse a passagem até a escada do Bloco B e desça mais um lance.'
                      : nextStage.mapId === 'bloco-a-salas'
                        ? 'Suba até o pátio e continue subindo pela mesma escada.'
                        : 'Suba a escada no fim da passagem para continuar no pátio.'}
                  </p>
                </div>
                <button onClick={() => showStage(nextStage.mapId)}>
                  {nextStage.mapId === 'bloco-b-andar-1' ? (
                    <MoveDown size={17} />
                  ) : (
                    <MoveUp size={17} />
                  )}
                  {nextStage.mapId === 'bloco-b-andar-1'
                    ? 'Já desci mais um andar'
                    : nextStage.mapId === 'bloco-a-salas'
                      ? 'Já subi até as salas'
                      : 'Já subi até o pátio'}
                </button>
              </output>
            )}
          <MapCanvas
            key={activeMap}
            ref={canvas}
            graph={activeGraph}
            mapView={views[activeMap]}
            mode="move"
            presentation
            origin={showRoute ? (activeStage?.startNodeId ?? '') : ''}
            selected={
              selectedDestination?.mapId === activeMap
                ? selectedDestination.nodeId
                : ''
            }
            selectedEdge=""
            connectionFrom=""
            routeEdges={activeStage?.edges ?? []}
            routeNodeIds={activeStage?.nodes ?? []}
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
              <i className="legend-entry" /> Partida
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
