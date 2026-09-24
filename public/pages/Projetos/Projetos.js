let projetos = [];
let filtroCurso = 'todos';
let filtroODS = 'todos';
let filtroSala = 'todos';

const container = document.getElementById('lista-projetos');
const containerBusca = document.getElementById('barra-busca');
containerBusca.innerHTML = criarSearchBar();
const campoBusca = document.getElementById('busca-projetos');

const normalizar = (valor) =>
  String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');

const escapar = (valor) =>
  String(valor ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

function configurarDropdown(id, opcoes, textoInicial, selecionar) {
  const dropdown = document.getElementById(id);
  const botao = dropdown.querySelector('.filtro');
  const lista = dropdown.querySelector('.opcoes-dropdown');
  dropdown.querySelector('.texto-filtro').textContent = textoInicial;
  lista.innerHTML = opcoes
    .map(
      ({ valor, texto }) =>
        `<button type="button" data-valor="${escapar(valor)}">${escapar(texto)}</button>`,
    )
    .join('');

  botao.onclick = (evento) => {
    evento.stopPropagation();
    document.querySelectorAll('.dropdown').forEach((outro) => {
      if (outro !== dropdown) outro.classList.remove('aberto');
    });
    dropdown.classList.toggle('aberto');
  };

  lista.querySelectorAll('button').forEach((opcao) => {
    opcao.onclick = (evento) => {
      evento.stopPropagation();
      dropdown.querySelector('.texto-filtro').textContent =
        opcao.textContent.trim();
      dropdown.classList.remove('aberto');
      selecionar(opcao.dataset.valor);
      atualizarProjetos();
    };
  });
}

function preencherFiltros() {
  const unicos = (valores) =>
    [...new Set(valores.filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, 'pt-BR'),
    );
  configurarDropdown(
    'dropdown-curso',
    [
      { valor: 'todos', texto: 'Todos os cursos' },
      ...unicos(projetos.flatMap((projeto) => projeto.courses)).map(
        (curso) => ({
          valor: curso,
          texto: curso,
        }),
      ),
    ],
    'Todos os cursos',
    (valor) => (filtroCurso = valor),
  );
  const ods = [
    ...new Map(
      projetos.flatMap((projeto) =>
        projeto.ods.map((item) => [item.number, item]),
      ),
    ).values(),
  ].sort((a, b) => a.number - b.number);
  configurarDropdown(
    'dropdown-ods',
    [
      { valor: 'todos', texto: 'Todas as ODS' },
      ...ods.map((item) => ({
        valor: String(item.number),
        texto: `ODS ${item.number} · ${item.name}`,
      })),
    ],
    'Todas as ODS',
    (valor) => (filtroODS = valor),
  );
  const locais = unicos(projetos.map((projeto) => projeto.location?.label));
  configurarDropdown(
    'dropdown-sala',
    [
      { valor: 'todos', texto: 'Todos os locais' },
      ...locais.map((local) => ({ valor: local, texto: local })),
      { valor: 'pendente', texto: 'Local a confirmar' },
    ],
    'Todos os locais',
    (valor) => (filtroSala = valor),
  );
}

function atualizarProjetos() {
  const busca = normalizar(campoBusca.value.trim());
  const filtrados = projetos.filter((projeto) => {
    const pesquisavel = normalizar(
      [
        projeto.name,
        projeto.description,
        ...projeto.courses,
        ...projeto.series,
        ...projeto.students,
        projeto.advisor,
        projeto.location?.label,
      ].join(' '),
    );
    return (
      (!busca || pesquisavel.includes(busca)) &&
      (filtroCurso === 'todos' || projeto.courses.includes(filtroCurso)) &&
      (filtroODS === 'todos' ||
        projeto.ods.some((item) => String(item.number) === filtroODS)) &&
      (filtroSala === 'todos' ||
        (filtroSala === 'pendente'
          ? !projeto.location
          : projeto.location?.label === filtroSala))
    );
  });
  renderizarProjetos(filtrados);
}

function paraCard(projeto) {
  const bloco = projeto.location?.mapId?.includes('bloco-b')
    ? 'B'
    : projeto.location?.mapId?.includes('bloco-a')
      ? 'A'
      : projeto.location
        ? 'Pátio'
        : '—';
  return {
    nome: projeto.name,
    subtitulo: projeto.description || 'Projeto da Feira Tecnológica',
    curso: projeto.courses.join(', ') || 'Curso a confirmar',
    sala: projeto.location?.label || 'Local a confirmar',
    bloco,
    imagem: '/projeto-placeholder.svg',
    ods: projeto.ods.map((item) => item.number),
    link: `/pages/Votacao/Votacao.html?projectId=${projeto.id}`,
  };
}

function renderizarProjetos(lista) {
  container.innerHTML = lista
    .map((projeto) => criarCard(paraCard(projeto)))
    .join('');
  if (!lista.length) {
    container.innerHTML =
      '<p class="nenhum-projeto">Nenhum projeto encontrado.</p>';
  }
}

async function carregarProjetos() {
  container.innerHTML = '<p class="nenhum-projeto">Carregando projetos…</p>';
  try {
    const resposta = await fetch('/api/projects', { cache: 'no-store' });
    if (!resposta.ok) throw new Error('API indisponível');
    const corpo = await resposta.json();
    projetos = Array.isArray(corpo.data) ? corpo.data : [];
    preencherFiltros();
    const parametros = new URLSearchParams(location.search);
    const odsInicial = parametros.get('ods');
    const buscaInicial = parametros.get('q');
    if (buscaInicial) campoBusca.value = buscaInicial;
    if (odsInicial) {
      filtroODS = odsInicial;
      const opcao = document.querySelector(
        `#dropdown-ods [data-valor="${CSS.escape(odsInicial)}"]`,
      );
      if (opcao) {
        document.querySelector('#dropdown-ods .texto-filtro').textContent =
          opcao.textContent.trim();
      }
    }
    atualizarProjetos();
  } catch {
    container.innerHTML =
      '<p class="nenhum-projeto">Não foi possível carregar os projetos agora.</p>';
  }
}

campoBusca.addEventListener('input', atualizarProjetos);
document.addEventListener('click', () =>
  document
    .querySelectorAll('.dropdown')
    .forEach((dropdown) => dropdown.classList.remove('aberto')),
);

void carregarProjetos();
