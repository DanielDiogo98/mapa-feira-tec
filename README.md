# Mapa da Feira Tecnológica

Aplicação responsiva para visitantes encontrarem projetos e receberem uma rota visual pela escola. O projeto também contém um editor técnico, separado da experiência pública, para cadastrar pontos e conexões diretamente sobre os SVGs.

## Executar o frontend

```powershell
npm install
npm run dev
```

Abra `http://localhost:3000`. A central dos editores fica em `http://localhost:3000/editor/mapas` durante o desenvolvimento.

## Mapas atuais

| Mapa                          | SVG    | Grafo                   |
| ----------------------------- | ------ | ----------------------- |
| Pátio, biblioteca e auditório | pronto | 26 pontos / 25 conexões |
| Bloco A · Salas               | pronto | 25 pontos / 24 conexões |
| Bloco B · 1º andar            | pronto | 20 pontos / 19 conexões |
| Bloco B · 2º andar            | pronto | 22 pontos / 22 conexões |

A página pública começa na entrada da escola. O mesmo mapa reúne o pátio, a passagem da biblioteca e do auditório, o elevador, os banheiros e a escada do Bloco B. Rotas para salas do Bloco A e para o segundo andar do Bloco B aparecem em duas partes. O primeiro andar do Bloco B aparece em três etapas: pátio, segundo andar e primeiro andar.

## Editor

1. Escolha **Ponto** e clique nas portas, mudanças de direção e destinos.
2. Use **Mover** para ajustar um ponto.
3. Escolha **Conectar** e clique nos pontos na ordem do caminho.
4. Use **Testar rota** antes de exportar.
5. Clique em **Salvar** para manter o trabalho no navegador e **Exportar** para gerar o JSON oficial.

Em builds de produção, o editor fica bloqueado por padrão. Uma implantação administrativa pode habilitá-lo com `NEXT_PUBLIC_MAP_EDITOR_ENABLED=true`. Isso ainda não substitui autenticação no servidor; mantenha essa implantação restrita à equipe.

## API PHP e MariaDB

As instruções estão em `backend/README.md`. O backend fornece projetos, catálogo de mapas e grafos somente para leitura. As migrações ficam em `database/` e preservam as tabelas atuais.

## Dados ainda pendentes

- Localização de `Valid` e `ShowMe`.
- Alunos, cursos e séries ligados a esses projetos.

Esses itens aparecem como indisponíveis ou “Local a confirmar”; a aplicação não inventa rotas para eles.

## Verificação

```powershell
npm run check
```

Esse comando valida os tipos e testa cálculo de rotas, integridade dos grafos e filtros de projetos.
