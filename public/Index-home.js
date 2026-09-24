// =========================================================
// FEIRA TECNOLÓGICA 2026 — script.js
// =========================================================

document.addEventListener('DOMContentLoaded', function () {
  /* =======================================================
     1. CONTAGEM REGRESSIVA + ANIMAÇÕES DE MARCOS
     ======================================================= */

  // Data/hora alvo: 26 de Setembro de 2026, 09h00 (horário de Brasília, UTC-3)
  const targetDate = new Date('2026-09-26T09:00:00-03:00').getTime();

  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');
  const countdownGrid = document.getElementById('countdown');
  const messageEl = document.getElementById('cd-message');

  const ONE_SECOND = 1000;
  const ONE_MINUTE = 60 * ONE_SECOND;
  const ONE_HOUR = 60 * ONE_MINUTE;
  const ONE_DAY = 24 * ONE_HOUR;
  const ONE_WEEK = 7 * ONE_DAY;

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  // Remove todas as classes de marco antes de aplicar a atual
  function clearMilestoneClasses() {
    countdownGrid.classList.remove(
      'anim-week',
      'anim-day',
      'anim-minute',
      'anim-ten',
    );
  }

  function applyMilestone(distance) {
    clearMilestoneClasses();

    if (distance <= 10 * ONE_SECOND) {
      countdownGrid.classList.add('anim-ten');
      messageEl.textContent = 'Atenção! Faltam poucos segundos!';
    } else if (distance <= ONE_MINUTE) {
      countdownGrid.classList.add('anim-minute');
      messageEl.textContent = 'Falta menos de 1 minuto!';
    } else if (distance <= ONE_DAY) {
      countdownGrid.classList.add('anim-day');
      messageEl.textContent = 'É amanhã! Prepare-se!';
    } else if (distance <= ONE_WEEK) {
      countdownGrid.classList.add('anim-week');
      messageEl.textContent = 'Estamos na última semana!';
    } else {
      messageEl.textContent = 'Contagem em andamento...';
    }
  }

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      clearMilestoneClasses();
      messageEl.textContent = 'A feira já começou!';
      clearInterval(countdownInterval);
      return;
    }

    const days = Math.floor(distance / ONE_DAY);
    const hours = Math.floor((distance % ONE_DAY) / ONE_HOUR);
    const minutes = Math.floor((distance % ONE_HOUR) / ONE_MINUTE);
    const seconds = Math.floor((distance % ONE_MINUTE) / ONE_SECOND);

    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);

    applyMilestone(distance);
  }

  updateCountdown();
  const countdownInterval = setInterval(updateCountdown, 1000);

  /* =======================================================
     2. MENU HAMBÚRGUER ANIMADO (3 barras → X)
     ======================================================= */

  const menuToggle = document.getElementById('menuToggle');
  const offcanvasEl = document.getElementById('mainMenu');

  if (menuToggle && offcanvasEl) {
    // O Bootstrap controla a abertura/fechamento do offcanvas via data-attributes.
    // Aqui apenas sincronizamos a classe "active" do botão com o estado do offcanvas
    // para animar as barras em um X.
    offcanvasEl.addEventListener('show.bs.offcanvas', function () {
      menuToggle.classList.add('active');
      menuToggle.setAttribute('aria-expanded', 'true');
    });

    offcanvasEl.addEventListener('hide.bs.offcanvas', function () {
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  }

  // Fecha o menu offcanvas ao clicar em um link de navegação
  const menuLinks = document.querySelectorAll('#mainMenu .nav-link-custom');

  menuLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
      if (bsOffcanvas) {
        bsOffcanvas.hide();
      }
    });
  });

  /* =======================================================
     3. ANIMAÇÕES DE ENTRADA DIFERENTES PARA CADA CARD
     ======================================================= */

  const revealCards = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealCards.length > 0) {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
      },
    );

    revealCards.forEach(function (card) {
      revealObserver.observe(card);
    });
  } else {
    // Fallback: navegadores sem suporte a IntersectionObserver mostram os cards direto
    revealCards.forEach(function (card) {
      card.classList.add('in-view');
    });
  }

  /* =======================================================
     4. PROJETOS, CATEGORIAS E ESTATÍSTICAS REAIS
     ======================================================= */

  const normalizar = (valor) =>
    String(valor ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR');

  function preencherDestaque(card, projeto, votos) {
    if (!card || !projeto) return;
    const odsContainer = card.querySelector('.project-thumb');
    odsContainer.innerHTML = projeto.ods.length
      ? projeto.ods
          .slice(0, 3)
          .map(
            (ods) =>
              `<span class="ods-badge ods-red">ODS ${Number(ods.number)}</span>`,
          )
          .join('')
      : '<span class="ods-badge ods-red">ODS a confirmar</span>';
    card.querySelector('.project-title').textContent = projeto.name;
    card.querySelector('.project-subtitle').textContent =
      projeto.description || 'Projeto da Feira Tecnológica';
    card.querySelector('.project-meta').textContent = [
      projeto.courses.join(', ') || 'Curso a confirmar',
      projeto.series.join(', ') || 'Turma a confirmar',
      projeto.location?.label || 'Local a confirmar',
    ].join(' · ');
    card.querySelector('.project-rating').textContent =
      votos > 0
        ? `${votos} voto${votos === 1 ? '' : 's'}`
        : 'Conheça este projeto';
    const botao = card.querySelector('button');
    botao.onclick = () => {
      location.href = `/pages/Votacao/Votacao.html?projectId=${Number(projeto.id)}`;
    };
  }

  function atualizarCategorias(projetos) {
    document.querySelectorAll('.category-card').forEach((card) => {
      const ods = Number(card.dataset.categoryOds);
      const termos = normalizar(card.dataset.categoryTerm)
        .split(/\s+/)
        .filter(Boolean);
      const quantidade = projetos.filter((projeto) => {
        if (ods) return projeto.ods.some((item) => Number(item.number) === ods);
        const texto = normalizar(
          [
            projeto.name,
            projeto.description,
            ...projeto.courses,
            ...projeto.ods.map((item) => item.name),
          ].join(' '),
        );
        return termos.some((termo) => texto.includes(termo));
      }).length;
      const contador = card.querySelector('.category-count');
      if (contador)
        contador.textContent = `${quantidade} projeto${quantidade === 1 ? '' : 's'}`;
    });
  }

  async function carregarDadosDaFeira() {
    try {
      const [catalogoResposta, rankingResposta] = await Promise.all([
        fetch('/api/projects', { cache: 'no-store' }),
        fetch('/api/ranking', {
          cache: 'no-store',
          credentials: 'include',
        }).catch(() => null),
      ]);
      if (!catalogoResposta.ok) throw new Error('Catálogo indisponível');
      const catalogo = await catalogoResposta.json();
      const projetos = Array.isArray(catalogo.data) ? catalogo.data : [];
      let ranking = [];
      if (rankingResposta?.ok) {
        const corpoRanking = await rankingResposta.json();
        ranking = Array.isArray(corpoRanking.ranking)
          ? corpoRanking.ranking
          : [];
      }
      const votos = new Map(
        ranking.map((item) => [
          Number(item.id_projeto),
          Number(item.quantidade_curtidas || 0),
        ]),
      );
      const destaques = [...projetos]
        .filter((projeto) => projeto.location)
        .sort(
          (a, b) =>
            (votos.get(Number(b.id)) || 0) - (votos.get(Number(a.id)) || 0) ||
            a.name.localeCompare(b.name, 'pt-BR'),
        )
        .slice(0, 3);
      document
        .querySelectorAll('[data-featured-project]')
        .forEach((card, indice) =>
          preencherDestaque(
            card,
            destaques[indice],
            votos.get(Number(destaques[indice]?.id)) || 0,
          ),
        );
      document.getElementById('project-count').textContent = String(
        projetos.length,
      );
      document.getElementById('student-count').textContent = String(
        new Set(
          projetos
            .flatMap((projeto) => projeto.students)
            .map(normalizar)
            .filter(Boolean),
        ).size,
      );
      atualizarCategorias(projetos);
    } catch (erro) {
      console.error('Não foi possível carregar os dados da feira.', erro);
    }
  }

  void carregarDadosDaFeira();
});
