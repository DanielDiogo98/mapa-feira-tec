# Mapa da Feira Tecnológica

Aplicação responsiva para visitantes encontrarem projetos e receberem uma rota visual pela escola. O projeto também contém um editor técnico, separado da experiência pública, para cadastrar pontos e conexões diretamente sobre os SVGs.

As plantas públicas usam versões limpas dos SVGs: os textos antigos do Figma são removidos e substituídos por etiquetas nítidas do sistema. Salas, corredores, entradas, escadas, portas e banheiros seguem a mesma paleta em todos os andares.

## Executar o frontend

```powershell
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Mapas atuais

| Mapa                          | SVG    | Grafo                   |
| ----------------------------- | ------ | ----------------------- |
| Pátio, biblioteca e auditório | pronto | 26 pontos / 25 conexões |
| Bloco A · Salas               | pronto | 25 pontos / 24 conexões |
| Bloco B · 1º andar            | pronto | 20 pontos / 19 conexões |
| Bloco B · 2º andar            | pronto | 22 pontos / 22 conexões |

A página pública começa na entrada da escola. O mesmo mapa reúne o pátio, a passagem da biblioteca e do auditório, o elevador, os banheiros e a escada do Bloco B. Rotas para salas do Bloco A e para o segundo andar do Bloco B aparecem em duas partes. O primeiro andar do Bloco B aparece em três etapas: pátio, segundo andar e primeiro andar.


## API PHP e MariaDB

As instruções estão em `backend/README.md`. O backend fornece projetos, catálogo de mapas e grafos somente para leitura. As migrações ficam em `database/` e preservam as tabelas atuais.
