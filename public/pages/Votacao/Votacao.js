(function () {
  const voteBtn = document.getElementById('voteBtn');
  const thumbIcon = document.getElementById('thumbIcon');
  const card = document.querySelector('.card');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalOkBtn = document.getElementById('modalOkBtn');
  const modalIcon = document.getElementById('modalIcon');
  const modalTitle = document.getElementById('modalTitle');
  const modalText = document.getElementById('modalText');
  const projectId = Number(
    new URLSearchParams(location.search).get('projectId'),
  );
  let projeto = null;
  let votoAtual = null;
  let votacaoAberta = false;
  let enviando = false;

  const escapar = (valor) =>
    String(valor ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

  function abrirModal(titulo, texto) {
    modalIcon.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>`;
    modalTitle.textContent = titulo;
    modalText.textContent = texto;
    modalOverlay.classList.add('open');
  }

  function fecharModal() {
    modalOverlay.classList.remove('open');
  }

  async function api(caminho, opcoes = {}) {
    const resposta = await fetch(caminho, {
      credentials: 'include',
      ...opcoes,
      headers: opcoes.body
        ? { 'Content-Type': 'application/json', ...(opcoes.headers || {}) }
        : opcoes.headers,
    });
    const corpo = await resposta.json().catch(() => ({}));
    if (!resposta.ok) {
      const erro = new Error(
        corpo.detail ||
          corpo.error ||
          'Não foi possível concluir a solicitação.',
      );
      erro.status = resposta.status;
      throw erro;
    }
    return corpo;
  }

  function preencherProjeto() {
    card.dataset.projectId = String(projeto.id);
    card.querySelector('.project-name').textContent = projeto.name;
    card.querySelector('.project-subtitle').textContent =
      projeto.series.join(', ') || projeto.shift || 'Feira Tecnológica 2026';
    card.querySelector('.tags').innerHTML = projeto.ods.length
      ? projeto.ods
          .map(
            (item) =>
              `<span class="tag tag-green">ODS ${item.number} - ${escapar(item.name)}</span>`,
          )
          .join('')
      : '<span class="tag tag-green">ODS a confirmar</span>';
    const valores = card.querySelectorAll('.info-value');
    valores[0].textContent = projeto.courses.join(', ') || 'A confirmar';
    valores[1].textContent = projeto.series.join(', ') || 'A confirmar';
    valores[2].textContent = projeto.location?.label || 'Local a confirmar';
    valores[3].textContent = projeto.advisor || 'A confirmar';
    card.querySelector('.about-text').textContent =
      projeto.description || 'Descrição ainda não cadastrada.';
    document.getElementById('membersList').innerHTML = projeto.students.length
      ? projeto.students
          .map((nome) => `<span class="chip">${escapar(nome)}</span>`)
          .join('')
      : '<span class="chip">Integrantes a confirmar</span>';
    document.title = `${projeto.name} | Feira Tecnológica`;
  }

  function atualizarBotao() {
    const selecionado = Number(votoAtual?.id_projeto) === projeto?.id;
    thumbIcon.classList.toggle('liked', selecionado);
    voteBtn.disabled = enviando || !votacaoAberta || !projeto;
    voteBtn.querySelector('.vote-title').textContent = selecionado
      ? 'Este é o seu projeto favorito'
      : votacaoAberta
        ? 'Já visitou este estande?'
        : 'Votação indisponível agora';
    voteBtn.querySelector('.vote-subtitle').textContent = selecionado
      ? 'Você pode escolher outro projeto enquanto a votação estiver aberta.'
      : votacaoAberta
        ? 'Deixe sua curtida se gostou do projeto!'
        : 'Consulte novamente durante o período de votação.';
  }

  async function iniciar() {
    if (!Number.isInteger(projectId) || projectId <= 0) {
      card.innerHTML = '<p class="about-text">Projeto não informado.</p>';
      voteBtn.disabled = true;
      return;
    }
    try {
      const catalogo = await api('/api/projects');
      projeto = (catalogo.data || []).find(
        (item) => Number(item.id) === projectId,
      );
      if (!projeto) throw new Error('Projeto não encontrado.');
      preencherProjeto();

      await api('/api/visitantes/identificar', { method: 'POST', body: '{}' });
      const status = await api('/api/votacao/status');
      votacaoAberta = Boolean(status.aberto);
      try {
        const voto = await api('/api/votos/meu-voto');
        votoAtual = voto.voto;
      } catch (erro) {
        if (erro.status !== 404) throw erro;
      }
      atualizarBotao();
    } catch (erro) {
      console.error(erro);
      voteBtn.disabled = true;
      voteBtn.querySelector('.vote-title').textContent =
        'Não foi possível carregar';
      voteBtn.querySelector('.vote-subtitle').textContent = erro.message;
    }
  }

  voteBtn.addEventListener('click', async () => {
    if (enviando || !votacaoAberta || !projeto) return;
    enviando = true;
    atualizarBotao();
    try {
      const resposta = await api('/api/votos', {
        method: 'PUT',
        body: JSON.stringify({ id_projeto: projeto.id }),
      });
      votoAtual = resposta.voto;
      abrirModal(
        'Voto registrado!',
        `Seu voto em ${projeto.name} foi salvo. Você pode alterá-lo enquanto a votação estiver aberta.`,
      );
    } catch (erro) {
      abrirModal('Não foi possível votar', erro.message);
    } finally {
      enviando = false;
      atualizarBotao();
    }
  });

  modalCloseBtn.addEventListener('click', fecharModal);
  modalOkBtn.addEventListener('click', fecharModal);
  modalOverlay.addEventListener('click', (evento) => {
    if (evento.target === modalOverlay) fecharModal();
  });

  void iniciar();
})();
