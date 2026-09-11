# Integração entre projetos e o mapa

O cadastro atual já separa projetos, cursos, séries, alunos e localizações. A ligação com o mapa usa dois identificadores adicionais na tabela `localizacao`:

- `mapa_id`: identifica a planta, por exemplo `bloco-a-salas`.
- `elemento_mapa_id`: identifica o destino dentro da planta, por exemplo `sala-02`.

O frontend recebe cada projeto neste formato:

```json
{
  "id": 1,
  "name": "Nome do projeto",
  "description": "Descrição",
  "shift": "Manhã",
  "courses": ["Informática para Internet"],
  "series": ["3°C"],
  "students": ["Nome do aluno"],
  "stand": 12,
  "ods": [{ "number": 9, "name": "Indústria, Inovação e Infraestrutura" }],
  "location": {
    "mapId": "bloco-a-salas",
    "elementId": "sala-02",
    "label": "Sala 2 Bloco A"
  }
}
```

Enquanto a API não estiver pronta, os dados ficam em `lib/projects-data.json`. A página pública filtra por texto, curso, série, turno, stand e ODS. Os seletores de stand e ODS aparecem automaticamente quando houver dados cadastrados. Projetos sem `location` aparecem como “Local a confirmar” e não iniciam uma rota.

Quando o backend estiver disponível, ele deve devolver a mesma estrutura. Assim, a troca do JSON pela API não exige mudar a tela nem o cálculo de rotas.

As passagens entre plantas ficam em `lib/map-portals.json`. A escada liga `escadas-bloco-a-salas`, no mapa do pátio, biblioteca e auditório, a `patio-das-salas`, no Bloco A. A mesma ligação pode ser gravada na tabela `mapa_portais` com `database/mapa-portais-seed.sql`.
