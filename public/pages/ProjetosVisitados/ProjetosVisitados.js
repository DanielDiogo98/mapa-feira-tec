const container = document.getElementById('lista-projetos');

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

async function api(caminho, opcoes = {}) {
  const resposta = await fetch(caminho, {
    credentials: 'include',
    cache: 'no-store',
    ...opcoes,
  });
  const corpo = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    const erro = new Error(
      corpo.detail || corpo.error || 'Serviço indisponível.',
    );
    erro.status = resposta.status;
    throw erro;
  }
  return corpo;
}

async function carregar() {
  container.innerHTML =
    '<p class="nenhum-projeto">Carregando seu projeto favorito…</p>';
  try {
    await api('/api/visitantes/identificar', { method: 'POST' });
    const [catalogo, voto] = await Promise.all([
      api('/api/projects'),
      api('/api/votos/meu-voto'),
    ]);
    const projeto = (catalogo.data || []).find(
      (item) => Number(item.id) === Number(voto.voto?.id_projeto),
    );
    if (!projeto)
      throw new Error('O projeto selecionado não está mais disponível.');
    container.innerHTML = criarCard(paraCard(projeto));
  } catch (erro) {
    if (erro.status === 404 || erro.status === 401) {
      container.innerHTML = `
        <div class="nenhum-projeto">
          <p>Você ainda não escolheu um projeto favorito.</p>
          <a class="projetos-link" href="/pages/Projetos/Projetos.html">Conhecer os projetos</a>
        </div>`;
      return;
    }
    console.error(erro);
    container.innerHTML =
      '<p class="nenhum-projeto">Não foi possível carregar seu projeto favorito agora.</p>';
  }
}

void carregar();
