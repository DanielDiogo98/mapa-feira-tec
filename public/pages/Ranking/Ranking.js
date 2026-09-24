import { CardRanking } from '../../components/CardRanking/CardRanking.js';
import { criarGraficoODS } from '../../components/GraficoODS/GraficoODS.js';

const productsContainer = document.querySelector('#products');
const containerBusca = document.getElementById('barra-busca');
containerBusca.innerHTML = criarSearchBar();
const campoBusca = document.getElementById('busca-projetos');
let ranking = [];

const normalizar = (valor) =>
  String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');

function renderizar(lista) {
  productsContainer.innerHTML = '';
  lista.forEach((projeto, indice) => {
    productsContainer.appendChild(
      CardRanking({
        colocacao: indice + 1,
        nome: projeto.name,
        ods: projeto.ods.map((item) => item.number),
        local: projeto.location?.label || 'Local a confirmar',
        curtidas: projeto.votes,
        projectId: projeto.id,
      }),
    );
  });
  if (!lista.length) {
    productsContainer.innerHTML = '<p>Nenhum projeto encontrado.</p>';
  }
}

function filtrar() {
  const busca = normalizar(campoBusca.value.trim());
  renderizar(
    ranking.filter((projeto) =>
      normalizar(
        [
          projeto.name,
          projeto.description,
          ...projeto.students,
          ...projeto.courses,
          ...projeto.series,
        ].join(' '),
      ).includes(busca),
    ),
  );
}

function atualizarResumo() {
  const estatisticas = document.querySelectorAll(
    '.ranking-header__estatistica strong',
  );
  const votados = ranking.filter((projeto) => projeto.votes > 0).length;
  const votos = ranking.reduce((total, projeto) => total + projeto.votes, 0);
  if (estatisticas[0]) estatisticas[0].textContent = String(votados);
  if (estatisticas[1]) estatisticas[1].textContent = String(votos);

  const nomesPodio = document.querySelectorAll('.podio__nome');
  // A ordem visual do HTML é 2º, 1º e 3º lugar.
  const indicesDoPodio = [1, 0, 2];
  nomesPodio.forEach((elemento, indice) => {
    const projeto = ranking[indicesDoPodio[indice]];
    elemento.textContent =
      votos > 0 && projeto?.votes > 0 ? projeto.name : 'Aguardando votos';
  });

  const votosPorOds = new Map();
  const haVotos = votos > 0;
  ranking.forEach((projeto) => {
    projeto.ods.forEach((ods) => {
      votosPorOds.set(
        ods.number,
        (votosPorOds.get(ods.number) || 0) + (haVotos ? projeto.votes : 1),
      );
    });
  });
  criarGraficoODS(
    document.querySelector('#graficoODS'),
    [...votosPorOds.entries()]
      .map(([ods, valor]) => ({ ods, valor }))
      .sort((a, b) => a.ods - b.ods),
  );
}

async function carregar() {
  productsContainer.innerHTML = '<p>Carregando ranking…</p>';
  try {
    const [rankingResponse, projectsResponse] = await Promise.all([
      fetch('/api/ranking', { credentials: 'include', cache: 'no-store' }),
      fetch('/api/projects', { cache: 'no-store' }),
    ]);
    if (!rankingResponse.ok || !projectsResponse.ok) {
      throw new Error('API indisponível');
    }
    const rankingBody = await rankingResponse.json();
    const projectsBody = await projectsResponse.json();
    const projects = new Map(
      (projectsBody.data || []).map((project) => [Number(project.id), project]),
    );
    ranking = (rankingBody.ranking || [])
      .map((item) => {
        const project = projects.get(Number(item.id_projeto));
        if (!project) return null;
        return {
          ...project,
          votes: Number(item.quantidade_curtidas || 0),
        };
      })
      .filter(Boolean)
      .sort(
        (a, b) => b.votes - a.votes || a.name.localeCompare(b.name, 'pt-BR'),
      );
    atualizarResumo();
    renderizar(ranking);
  } catch (erro) {
    console.error(erro);
    productsContainer.innerHTML =
      '<p>Não foi possível carregar o ranking agora.</p>';
  }
}

campoBusca.addEventListener('input', filtrar);
void carregar();
