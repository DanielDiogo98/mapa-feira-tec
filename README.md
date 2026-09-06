# Mapa da Feira Tecnológica

Projeto React inicial do mapa piloto do Bloco A.

## Abrir no computador

Com Node.js instalado, abra um terminal nesta pasta e execute:

    npm install
    npm run dev

Abra o endereço exibido no terminal. Para conferir a versão de produção: `npm run build`.

## Controles

- Arraste com o mouse ou com um dedo para mover.
- Roda do mouse, gesto de pinça ou botões + e − para zoom.
- Ajustar mapa retorna à visão completa.
- Com o mapa focado: setas movem, +/− ampliam/reduzem e 0 ajusta.

## Arquivos principais

- app/page.tsx: visualizador e controles.
- app/globals.css: aparência da interface.
- public/mapas/bloco-a-salas.svg: arquivo original, sem modificações.

O projeto usa React com Vinext/Vite. Esta etapa não conecta o banco, não calcula rotas e não cria pontos. O próximo passo é adicionar o editor de pontos sobre as coordenadas originais do SVG (12861 × 42113). Os identificadores do SVG foram preservados; o desenho está carregado como imagem nesta etapa.
