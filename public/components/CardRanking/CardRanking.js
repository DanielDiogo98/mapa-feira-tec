export function CardRanking({
  colocacao,
  nome,
  ods,
  local,
  curtidas,
  projectId,
}) {
  const card = document.createElement('article');

  card.classList.add('card-ranking');

  const escapar = (valor) =>
    String(valor ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

  card.innerHTML = `
        <div class="ranking-numero">
            ${Number(colocacao)}º
        </div>

        <div class="ranking-info">

            <h2><a href="/pages/Votacao/Votacao.html?projectId=${Number(projectId)}">${escapar(nome)}</a></h2>

            <div class="ranking-detalhes">

                <div class="ranking-ods">
                    ${ods
                      .map(
                        (odsItem) => `
                        <span class="ods-tag">ODS ${Number(odsItem)}</span>
                    `,
                      )
                      .join('')}
                </div>

                <span class="ranking-localizacao">
                    ${escapar(local)}
                </span>

            </div>

        </div>

        <div class="ranking-curtidas">
            <span class="numero-curtidas">${Number(curtidas)}</span>
            <i class="fa-solid fa-thumbs-up"></i>

        </div>
    `;

  return card;
}
