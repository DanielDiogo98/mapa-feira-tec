'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Map as MapIcon,
  MousePointer2,
  MapPinPlus,
  GitBranch,
  Route,
  Download,
  Upload,
  Save,
  Undo2,
  Redo2,
  Trash2,
  LocateFixed,
  ArrowRight,
  Check,
  CircleHelp,
  X,
  Link2,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  MapCanvas,
  type CanvasHandle,
  type Mode,
} from '@/components/map-canvas';
import {
  parseGraph,
  connect,
  removePoint,
  shortestPath,
  inspectGraph,
  KINDS,
  ELEMENTS,
  emptyGraph,
  type MapDefinition,
  type Graph,
  type MapPoint,
  type NodeKind,
} from '@/lib/graph';
import type { MapView } from '@/components/map-canvas';

export type MapEditorConfig = {
  map: MapDefinition;
  view: MapView;
  title: string;
  subtitle: string;
  workspaceLabel: string;
  storageKey: string;
  downloadName: string;
  otherMapHref: string;
  otherMapLabel: string;
  initialGraph?: Graph;
  elements?: readonly string[];
};
const uid = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;
const tools = [
  {
    id: 'move',
    label: 'Mover',
    icon: MousePointer2,
    hint: 'Arraste a planta para navegar ou um ponto para reposicioná-lo.',
  },
  {
    id: 'add',
    label: 'Ponto',
    icon: MapPinPlus,
    hint: 'Clique na planta para marcar um ponto. Use as portas e as curvas dos caminhos.',
  },
  {
    id: 'connect',
    label: 'Conectar',
    icon: GitBranch,
    hint: 'Clique em dois pontos para conectá-los. Continue clicando para formar um caminho.',
  },
] as const;

function PointEditor({
  point,
  onUpdate,
  elements,
}: {
  point: MapPoint;
  onUpdate: (point: MapPoint) => void;
  elements: readonly string[];
}) {
  const [name, setName] = useState(point.label);
  useEffect(() => setName(point.label), [point.label]);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim()) onUpdate({ ...point, label: name.trim() });
      }}
      className="point-form"
    >
      <label htmlFor="point-name">Nome do ponto</label>
      <div className="name-input">
        <input
          id="point-name"
          value={name}
          maxLength={80}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button
          aria-label="Aplicar nome"
          title="Aplicar nome"
          disabled={!name.trim() || name.trim() === point.label}
        >
          <Check size={17} />
        </button>
      </div>
      <label htmlFor="point-kind">Tipo</label>
      <NativeSelect
        id="point-kind"
        value={point.kind}
        onChange={(e) =>
          onUpdate({ ...point, kind: e.target.value as NodeKind })
        }
      >
        {Object.entries(KINDS).map(([id, label]) => (
          <NativeSelectOption value={id} key={id}>
            {label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <label htmlFor="point-element">
        Elemento da planta <span className="optional">opcional</span>
      </label>
      <NativeSelect
        id="point-element"
        value={point.elementId ?? ''}
        onChange={(e) =>
          onUpdate({ ...point, elementId: e.target.value || undefined })
        }
      >
        <NativeSelectOption value="">Sem associação</NativeSelectOption>
        {elements.map((id) => (
          <NativeSelectOption key={id} value={id}>
            {id}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <p className="field-help">
        Os nomes da planta são referências técnicas, não a numeração oficial das
        salas.
      </p>
    </form>
  );
}

function MapEditorWorkspace({ config }: { config: MapEditorConfig }) {
  const elements = config.elements ?? ELEMENTS;
  const initialGraph = useMemo(
    () => config.initialGraph ?? emptyGraph(config.map),
    [config],
  );
  const [graph, setGraph] = useState<Graph>(initialGraph),
    graphRef = useRef(graph);
  const [saved, setSaved] = useState(JSON.stringify(initialGraph)),
    [initialized, setInitialized] = useState(false);
  const [storageProblem, setStorageProblem] = useState(false);
  const undoStack = useRef<Graph[]>([]),
    redoStack = useRef<Graph[]>([]);
  const [, refreshHistory] = useState(0);
  const [selected, setSelected] = useState(''),
    [selectedEdge, setSelectedEdge] = useState('');
  const [mode, setMode] = useState<Mode>('move'),
    [tab, setTab] = useState('edit');
  const [connectionFrom, setConnectionFrom] = useState(''),
    [kind, setKind] = useState<NodeKind>('corridor');
  const [origin, setOrigin] = useState(''),
    [destination, setDestination] = useState(''),
    [requested, setRequested] = useState(false);
  const [notice, setNotice] = useState(''),
    [pendingImport, setPendingImport] = useState<Graph | null>(null);
  const file = useRef<HTMLInputElement>(null),
    canvas = useRef<CanvasHandle>(null);
  const dirty = JSON.stringify(graph) !== saved;
  const put = useCallback((g: Graph) => {
    graphRef.current = g;
    setGraph(g);
  }, []);
  const commit = useCallback(
    (next: Graph, message?: string) => {
      if (
        next === graphRef.current ||
        JSON.stringify(next) === JSON.stringify(graphRef.current)
      )
        return;
      undoStack.current = [...undoStack.current.slice(-49), graphRef.current];
      redoStack.current = [];
      put(next);
      refreshHistory((n) => n + 1);
      if (message) setNotice(message);
    },
    [put],
  );
  const undo = useCallback(() => {
    const g = undoStack.current.pop();
    if (!g) return;
    redoStack.current.push(graphRef.current);
    put(g);
    setConnectionFrom('');
    refreshHistory((n) => n + 1);
    setNotice('Alteração desfeita.');
  }, [put]);
  const redo = useCallback(() => {
    const g = redoStack.current.pop();
    if (!g) return;
    undoStack.current.push(graphRef.current);
    put(g);
    setConnectionFrom('');
    refreshHistory((n) => n + 1);
    setNotice('Alteração refeita.');
  }, [put]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(config.storageKey);
      if (raw) {
        const restored = parseGraph(JSON.parse(raw), config.map, elements);
        put(restored);
        setSaved(JSON.stringify(restored));
        setNotice('Mapa salvo neste navegador restaurado.');
      }
    } catch {
      setStorageProblem(true);
      setNotice(
        'Não foi possível restaurar o mapa salvo. O conteúdo anterior não foi alterado. Exporte seu trabalho para guardar uma cópia.',
      );
    }
    setInitialized(true);
  }, [config.map, config.storageKey, elements, put]);
  const save = useCallback(() => {
    try {
      localStorage.setItem(config.storageKey, JSON.stringify(graphRef.current));
      setSaved(JSON.stringify(graphRef.current));
      setStorageProblem(false);
      setNotice(
        'Salvo neste navegador. Exporte também uma cópia para guardar em arquivo.',
      );
    } catch {
      setStorageProblem(true);
      setNotice(
        'O navegador não permitiu salvar. Use Exportar para guardar seu mapa em arquivo.',
      );
    }
  }, [config.storageKey]);
  useEffect(() => {
    type WebDocument = Document & {
      modelContext?: {
        registerTool: (
          tool: {
            name: string;
            title: string;
            description: string;
            inputSchema: object;
            annotations: object;
            execute: (input: unknown) => unknown;
          },
          options: { signal: AbortSignal },
        ) => void | Promise<void>;
      };
    };
    const context = (document as WebDocument).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    Promise.resolve(
      context.registerTool(
        {
          name: 'save_map_in_browser',
          title: 'Salvar mapa',
          description:
            'Salva os pontos e conexões atuais deste editor no navegador.',
          inputSchema: {
            type: 'object',
            properties: {},
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute: () => {
            save();
            return {
              saved: true,
              mapId: graphRef.current.mapId,
              points: graphRef.current.nodes.length,
              connections: graphRef.current.edges.length,
            };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => {});
    return () => lifecycle.abort();
  }, [save]);
  useEffect(() => {
    const keys = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target.matches('input,textarea,select') || target.isContentEditable;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        save();
      } else if (
        !typing &&
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === 'z'
      ) {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (e.key === 'Escape') setConnectionFrom('');
    };
    window.addEventListener('keydown', keys);
    return () => window.removeEventListener('keydown', keys);
  }, [save, undo, redo]);
  useEffect(() => {
    if (!dirty) return;
    const leave = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', leave);
    return () => window.removeEventListener('beforeunload', leave);
  }, [dirty]);
  const selectedPoint = graph.nodes.find((n) => n.id === selected),
    edge = graph.edges.find((e) => e.id === selectedEdge);
  const health = useMemo(() => inspectGraph(graph), [graph]);
  const result = useMemo(
    () => (requested ? shortestPath(graph, origin, destination) : null),
    [requested, graph, origin, destination],
  );
  const activeRoute = tab === 'route' && result ? result.edges : [];
  const pointName = (id: string) =>
    graph.nodes.find((n) => n.id === id)?.label ?? 'Ponto removido';
  function choose(id: string) {
    setSelected(id);
    setSelectedEdge('');
    if (tab === 'edit' && mode === 'connect') {
      if (
        !connectionFrom ||
        !graph.nodes.some((n) => n.id === connectionFrom)
      ) {
        setConnectionFrom(id);
        setNotice('Agora escolha o próximo ponto.');
        return;
      }
      if (connectionFrom === id) {
        setConnectionFrom('');
        return;
      }
      const next = connect(graphRef.current, connectionFrom, id, uid('edge'));
      if (next === graphRef.current)
        setNotice('Esses pontos já estão conectados.');
      else
        commit(
          next,
          'Conexão criada. Escolha o próximo ponto ou pressione Esc.',
        );
      setConnectionFrom(id);
    }
  }
  function add(p: { x: number; y: number }) {
    if (graphRef.current.nodes.length >= 2000) {
      setNotice('Limite de 2.000 pontos atingido.');
      return;
    }
    let number = graphRef.current.nodes.length + 1;
    while (
      graphRef.current.nodes.some((n) => n.label === `${KINDS[kind]} ${number}`)
    )
      number++;
    const n: MapPoint = {
      id: uid('point'),
      label: `${KINDS[kind]} ${number}`,
      kind,
      ...p,
    };
    commit(
      { ...graphRef.current, nodes: [...graphRef.current.nodes, n] },
      'Ponto adicionado.',
    );
    setSelected(n.id);
    setSelectedEdge('');
  }
  function deletePoint(id: string) {
    commit(
      removePoint(graphRef.current, id),
      'Ponto e suas conexões removidos. Você pode desfazer.',
    );
    if (selected === id) setSelected('');
    if (connectionFrom === id) setConnectionFrom('');
  }
  function download() {
    const blob = new Blob([JSON.stringify(graphRef.current, null, 2)], {
        type: 'application/json',
      }),
      url = URL.createObjectURL(blob),
      a = document.createElement('a');
    a.href = url;
    a.download = config.downloadName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Arquivo de pontos exportado. Ele inclui todas as conexões.');
  }
  async function importFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      if (f.size > 2_000_000)
        throw new Error('Escolha um arquivo de até 2 MB.');
      const next = parseGraph(JSON.parse(await f.text()), config.map, elements);
      if (graphRef.current.nodes.length) setPendingImport(next);
      else acceptImport(next);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : 'Não foi possível importar o arquivo.',
      );
    }
  }
  function acceptImport(g: Graph) {
    commit(g, 'Mapa importado. Salve neste navegador para mantê-lo ao voltar.');
    setSelected('');
    setSelectedEdge('');
    setConnectionFrom('');
    setOrigin('');
    setDestination('');
    setRequested(false);
    setPendingImport(null);
    canvas.current?.fit();
  }
  return (
    <main className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-icon">
            <MapIcon size={22} />
          </span>
          <div>
            <strong>Feira Tecnológica</strong>
            <span>Estúdio do mapa</span>
          </div>
        </div>
        <div className="header-actions">
          <a className="btn quiet" href={config.otherMapHref}>
            <MapIcon size={16} />
            <span>{config.otherMapLabel}</span>
          </a>
          <span className={`save-state${dirty ? ' unsaved' : ''}`}>
            <i />
            {!initialized
              ? 'Abrindo…'
              : dirty
                ? 'Alterações não salvas'
                : 'Tudo salvo'}
          </span>
          <button className="btn quiet" onClick={() => file.current?.click()}>
            <Upload size={16} />
            <span>Importar</span>
          </button>
          <button className="btn quiet" onClick={download}>
            <Download size={16} />
            <span>Exportar</span>
          </button>
          <button
            className="btn primary"
            onClick={save}
            disabled={!initialized}
          >
            <Save size={16} />
            <span>Salvar</span>
          </button>
          <input
            type="file"
            ref={file}
            accept=".json,application/json"
            onChange={importFile}
            hidden
            aria-label="Importar arquivo de pontos"
          />
        </div>
      </header>
      <div className="studio">
        <aside className="editor-panel">
          <div className="panel-title">
            <span className="eyebrow">MAPA PILOTO</span>
            <h1>{config.title}</h1>
            <p>{config.subtitle}</p>
          </div>
          <Tabs
            value={tab}
            onValueChange={(v) => {
              setTab(String(v));
              setConnectionFrom('');
            }}
            className="editor-tabs"
          >
            <TabsList className="panel-tabs">
              <TabsTrigger value="edit">
                <MapPin size={15} />
                Editar
              </TabsTrigger>
              <TabsTrigger value="route">
                <Route size={15} />
                Testar rota
              </TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="tab-content">
              <div className="section-label">
                FERRAMENTAS{' '}
                <div className="history">
                  <button
                    aria-label="Desfazer"
                    title="Desfazer (Ctrl+Z)"
                    disabled={!undoStack.current.length}
                    onClick={undo}
                  >
                    <Undo2 size={16} />
                  </button>
                  <button
                    aria-label="Refazer"
                    title="Refazer (Ctrl+Shift+Z)"
                    disabled={!redoStack.current.length}
                    onClick={redo}
                  >
                    <Redo2 size={16} />
                  </button>
                </div>
              </div>
              <div className="tool-options">
                {tools.map((t) => (
                  <button
                    key={t.id}
                    aria-pressed={mode === t.id}
                    onClick={() => {
                      setMode(t.id);
                      setConnectionFrom('');
                    }}
                  >
                    <t.icon size={20} />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
              <p className="tool-hint">
                {connectionFrom && mode === 'connect'
                  ? `Conectando a partir de ${pointName(connectionFrom)}. Escolha outro ponto.`
                  : tools.find((t) => t.id === mode)!.hint}
              </p>
              {mode === 'add' && (
                <div className="new-point-kind">
                  <label htmlFor="new-kind">Tipo do novo ponto</label>
                  <NativeSelect
                    id="new-kind"
                    value={kind}
                    onChange={(e) => setKind(e.target.value as NodeKind)}
                  >
                    {Object.entries(KINDS).map(([key, label]) => (
                      <NativeSelectOption key={key} value={key}>
                        {label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
              )}
              {connectionFrom && (
                <button
                  className="text-button"
                  onClick={() => setConnectionFrom('')}
                >
                  Encerrar conexão <X size={14} />
                </button>
              )}
              <div className="divider" />
              {selectedPoint ? (
                <>
                  <div className="section-label">
                    PONTO SELECIONADO{' '}
                    <button
                      className="icon-button"
                      aria-label="Centralizar ponto"
                      title="Centralizar ponto"
                      onClick={() => canvas.current?.focusPoint(selectedPoint)}
                    >
                      <LocateFixed size={17} />
                    </button>
                  </div>
                  <PointEditor
                    key={selectedPoint.id}
                    point={selectedPoint}
                    elements={elements}
                    onUpdate={(n) =>
                      commit({
                        ...graphRef.current,
                        nodes: graphRef.current.nodes.map((p) =>
                          p.id === n.id ? n : p,
                        ),
                      })
                    }
                  />
                  <button
                    className="text-button danger"
                    onClick={() => deletePoint(selectedPoint.id)}
                  >
                    <Trash2 size={15} />
                    Remover ponto
                  </button>
                </>
              ) : edge ? (
                <>
                  <div className="section-label">CONEXÃO SELECIONADA</div>
                  <div className="connection-details">
                    <span>{pointName(edge.from)}</span>
                    <Link2 size={17} />
                    <span>{pointName(edge.to)}</span>
                  </div>
                  <p className="field-help">
                    Este caminho pode ser percorrido nos dois sentidos.
                  </p>
                  <button
                    className="text-button danger"
                    onClick={() => {
                      commit(
                        {
                          ...graphRef.current,
                          edges: graphRef.current.edges.filter(
                            (e) => e.id !== edge.id,
                          ),
                        },
                        'Conexão removida.',
                      );
                      setSelectedEdge('');
                    }}
                  >
                    <Trash2 size={15} />
                    Remover conexão
                  </button>
                </>
              ) : (
                <div className="getting-started">
                  <span className="empty-icon">
                    <MapPinPlus size={23} />
                  </span>
                  <h2>
                    {graph.nodes.length
                      ? 'Escolha um ponto'
                      : 'Seu primeiro caminho'}
                  </h2>
                  <p>
                    {graph.nodes.length
                      ? 'Clique em um ponto para editar o nome, o tipo e a posição.'
                      : 'Marque as portas e as mudanças de direção. Depois, conecte os pontos seguindo os espaços de passagem.'}
                  </p>
                  {!graph.nodes.length && (
                    <button
                      className="btn start-button"
                      onClick={() => setMode('add')}
                    >
                      Adicionar primeiro ponto <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              )}
              <div className="divider" />
              <div className="section-label">
                PONTOS NO MAPA{' '}
                <span className="count">{graph.nodes.length}</span>
              </div>
              <div className="point-list">
                {graph.nodes.map((n, i) => (
                  <button
                    key={n.id}
                    className={selected === n.id ? 'active' : ''}
                    onClick={() => {
                      setSelected(n.id);
                      setSelectedEdge('');
                      canvas.current?.focusPoint(n);
                    }}
                  >
                    <span className={`list-number kind-${n.kind}`}>
                      {i + 1}
                    </span>
                    <span>
                      {n.label}
                      <small>{KINDS[n.kind]}</small>
                    </span>
                    <LocateFixed size={15} />
                  </button>
                ))}
                {!graph.nodes.length && (
                  <p className="subtle">
                    Os pontos que você criar aparecerão aqui.
                  </p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="route" className="tab-content">
              <div className="route-intro">
                <span className="empty-icon">
                  <Route size={23} />
                </span>
                <h2>Experimente um trajeto</h2>
                <p>
                  Escolha dois pontos para encontrar o menor caminho entre as
                  conexões que você criou.
                </p>
              </div>
              <label htmlFor="origin">Origem</label>
              <NativeSelect
                id="origin"
                value={graph.nodes.some((n) => n.id === origin) ? origin : ''}
                onChange={(e) => {
                  setOrigin(e.target.value);
                  setRequested(false);
                }}
              >
                <NativeSelectOption value="">
                  Escolha o ponto de partida
                </NativeSelectOption>
                {graph.nodes.map((n, i) => (
                  <NativeSelectOption key={n.id} value={n.id}>
                    {i + 1}. {n.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <label htmlFor="destination">Destino</label>
              <NativeSelect
                id="destination"
                value={
                  graph.nodes.some((n) => n.id === destination)
                    ? destination
                    : ''
                }
                onChange={(e) => {
                  setDestination(e.target.value);
                  setRequested(false);
                }}
              >
                <NativeSelectOption value="">
                  Escolha onde quer chegar
                </NativeSelectOption>
                {graph.nodes.map((n, i) => (
                  <NativeSelectOption key={n.id} value={n.id}>
                    {i + 1}. {n.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <button
                className="btn primary route-button"
                disabled={
                  !graph.nodes.some((n) => n.id === origin) ||
                  !graph.nodes.some((n) => n.id === destination) ||
                  origin === destination
                }
                onClick={() => {
                  setRequested(true);
                  canvas.current?.fit();
                }}
              >
                <Route size={17} />
                Calcular rota
              </button>
              {origin && origin === destination && (
                <p className="field-help">Escolha dois pontos diferentes.</p>
              )}
              {requested &&
                (result ? (
                  <div className="route-result">
                    <div>
                      <Check size={18} />
                      <strong>Rota encontrada</strong>
                    </div>
                    <p>
                      {result.edges.length}{' '}
                      {result.edges.length === 1 ? 'conexão' : 'conexões'} pelo
                      caminho destacado.
                    </p>
                    <ol>
                      {result.nodes.map((id) => (
                        <li key={id}>{pointName(id)}</li>
                      ))}
                    </ol>
                    <button
                      className="text-button"
                      onClick={() => setRequested(false)}
                    >
                      Limpar rota
                    </button>
                  </div>
                ) : (
                  <div className="warning">
                    <AlertCircle size={18} />
                    <p>
                      Esses pontos ainda não têm um caminho entre si. Volte ao
                      editor e conecte os trechos que faltam.
                    </p>
                  </div>
                ))}
              <div className="route-note">
                <CircleHelp size={17} />
                <p>
                  A rota segue os segmentos desenhados. Confira se eles passam
                  por portas e corredores, sem atravessar paredes. A planta
                  ainda não tem escala em metros.
                </p>
              </div>
            </TabsContent>
          </Tabs>
          <div className="panel-footer">
            <Save size={15} />
            <span>
              Salvo apenas neste navegador.
              <br />
              Exporte uma cópia para guardar ou compartilhar.
            </span>
          </div>
        </aside>
        <section className="map-workspace">
          <div className="workspace-bar">
            <div>
              <span className="live-dot" />
              <strong>
                {tab === 'edit' ? 'Editor de caminhos' : 'Prévia da rota'}
              </strong>
              <span className="bar-divider">/</span>
              <span>{config.workspaceLabel}</span>
            </div>
            <span className="map-meta">
              {graph.nodes.length} pontos · {graph.edges.length} conexões
            </span>
          </div>
          <MapCanvas
            ref={canvas}
            graph={graph}
            mode={tab === 'route' ? 'move' : mode}
            selected={selectedPoint?.id ?? ''}
            selectedEdge={edge?.id ?? ''}
            connectionFrom={connectionFrom}
            routeEdges={activeRoute}
            mapView={config.view}
            onAdd={add}
            onSelect={choose}
            onSelectEdge={(id) => {
              setSelectedEdge(id);
              setSelected('');
            }}
            onMove={(id, p) => {
              if (tab === 'edit')
                commit({
                  ...graphRef.current,
                  nodes: graphRef.current.nodes.map((n) =>
                    n.id === id ? { ...n, ...p } : n,
                  ),
                });
            }}
            onDelete={(id) => {
              if (tab === 'edit') deletePoint(id);
            }}
          />
          <footer className="map-footer">
            <div className="legend">
              <span>
                <i className="room" />
                Salas
              </span>
              <span>
                <i className="door" />
                Portas
              </span>
              <span>
                <i className="stairs" />
                Escadas
              </span>
              <span>
                <i className="path" />
                Caminhos
              </span>
            </div>
            <span className="health">
              {health.isolated.length
                ? `${health.isolated.length} ponto(s) sem conexão`
                : graph.nodes.length
                  ? `${health.components} rede(s) de caminhos`
                  : 'Nenhum caminho criado'}
            </span>
          </footer>
        </section>
      </div>
      {notice && (
        <output className={`notice${storageProblem ? ' warning-notice' : ''}`}>
          <span>{notice}</span>
          <button aria-label="Fechar aviso" onClick={() => setNotice('')}>
            <X size={16} />
          </button>
        </output>
      )}
      <AlertDialog
        open={!!pendingImport}
        onOpenChange={(open) => {
          if (!open) setPendingImport(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Substituir os pontos atuais?</AlertDialogTitle>
          <AlertDialogDescription>
            O arquivo contém {pendingImport?.nodes.length} pontos e{' '}
            {pendingImport?.edges.length} conexões. A planta permanece a mesma.
            Você poderá desfazer a importação.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingImport) acceptImport(pendingImport);
              }}
            >
              Importar mapa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

export function MapEditor({ config }: { config: MapEditorConfig }) {
  const enabled =
    process.env.NODE_ENV !== 'production' ||
    process.env.NEXT_PUBLIC_MAP_EDITOR_ENABLED === 'true';
  if (!enabled) {
    return (
      <main className="editor-locked">
        <span className="brand-icon">
          <MapIcon size={24} />
        </span>
        <span className="eyebrow">ÁREA TÉCNICA</span>
        <h1>Editor indisponível</h1>
        <p>
          Os visitantes podem consultar o mapa, mas não alterar pontos ou
          caminhos.
        </p>
        <Link className="btn primary" href="/">
          Voltar ao mapa
        </Link>
      </main>
    );
  }
  return <MapEditorWorkspace config={config} />;
}
