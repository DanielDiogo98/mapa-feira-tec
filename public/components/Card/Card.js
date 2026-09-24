function criarCard(projeto) {
  const escapar = (valor) =>
    String(valor ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

  const link = String(projeto.link || '').startsWith('/')
    ? escapar(projeto.link)
    : '#';

  return `
        <article class="card-projeto">

            <div class="card-imagem-container">

                <img
                    src="${escapar(projeto.imagem || '/projeto-placeholder.svg')}"
                    alt="${escapar(projeto.nome)}"
                    class="card-imagem"
                >

                <div class="card-ods">
                    ${criarListaODS(projeto.ods)}
                </div>

            </div>


            <div class="card-conteudo">

                <h2 class="card-titulo">
                    ${escapar(projeto.nome)}
                </h2>

                <p class="card-subtitulo">
                    ${escapar(projeto.subtitulo)}
                </p>

                <p class="card-curso">
                    ${escapar(projeto.curso)}
                </p>

                <div class="card-local">

                    <span>
                        Local: ${escapar(projeto.sala)}
                    </span>

                    <span>
                        Bloco: ${escapar(projeto.bloco)}
                    </span>

                </div>

                <a
                    href="${link}"
                    class="card-botao"
                >
                    Ver detalhes
                </a>

            </div>

        </article>
    `;
}
