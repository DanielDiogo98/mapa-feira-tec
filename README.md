# Mapa da Feira Tecnológica

Editor visual do mapa piloto do Bloco A.

## Abrir no computador

Dentro desta pasta, execute:

    npm run dev

Abra o endereço mostrado no terminal, normalmente `http://localhost:3000`.

## Fluxo do editor

1. Escolha **Ponto** e clique nas portas, mudanças de direção e destinos.
2. Use **Mover** para reposicionar os pontos.
3. Escolha **Conectar** e clique nos pontos na ordem do caminho.
4. Abra **Testar rota**, selecione origem e destino e calcule o trajeto.
5. Clique em **Salvar** para manter o trabalho neste navegador e em **Exportar** para guardar uma cópia JSON.

O botão **Importar** aceita somente arquivos JSON compatíveis com esta planta. Quando já existem pontos, o editor pede confirmação antes de substituí-los.

## Dados

- `public/mapas/bloco-a-salas.svg`: SVG original, preservado.
- `public/mapas/bloco-a-salas-visual.svg`: cópia com cores de apresentação.
- Os pontos usam as coordenadas originais de `12861 × 42113`.
- O recorte inicial da câmera apenas esconde a margem vazia; ele não altera as coordenadas.
- O salvamento atual usa o navegador. A integração com PHP/MariaDB será feita em uma etapa posterior.

## Verificação

    node --test tests/graph.test.mjs
    npm run build
