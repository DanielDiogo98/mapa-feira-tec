<?php
declare(strict_types=1);

final class ProjectRepository
{
    public function __construct(private PDO $pdo) {}

    public function search(array $filters): array
    {
        $sql = <<<'SQL'
SELECT p.id_projeto, p.nome_projeto, p.descricao, p.turno,
       a.nome_aluno, c.nome_curso, s.nome_serie,
       st.numero_stand, o.numero_ods, o.nome AS nome_ods,
       l.local, l.bloco, l.numero_sala, l.andar, l.mapa_id, l.elemento_mapa_id
FROM projetos p
LEFT JOIN alunos_projetos ap ON ap.fk_projetos_id_projeto = p.id_projeto
LEFT JOIN alunos a ON a.id_aluno = ap.fk_aluno_id_aluno
LEFT JOIN curso_projetos cp ON cp.fk_projetos_id_projeto = p.id_projeto
LEFT JOIN curso c ON c.id_curso = cp.fk_curso_id_curso
LEFT JOIN serie_projetos sp ON sp.fk_projetos_id_projeto = p.id_projeto
LEFT JOIN serie s ON s.id_serie = sp.fk_serie_id_serie
LEFT JOIN stand st ON st.fk_projetos_id_projeto = p.id_projeto
LEFT JOIN ods_projetos op ON op.fk_projetos_id_projeto = p.id_projeto
LEFT JOIN ods o ON o.numero_ods = op.fk_ods_numero_ods
LEFT JOIN localizacao_projetos lp ON lp.fk_projetos_id_projeto = p.id_projeto
LEFT JOIN localizacao l ON l.id_localizacao = lp.fk_localizacao_id_localizacao
ORDER BY p.nome_projeto, p.id_projeto
SQL;
        $rows = $this->pdo->query($sql)->fetchAll();
        $projects = [];
        foreach ($rows as $row) {
            $id = (int) $row['id_projeto'];
            $projects[$id] ??= [
                'id' => $id,
                'name' => $row['nome_projeto'] ?? '',
                'description' => trim($row['descricao'] ?? ''),
                'shift' => $row['turno'] ?? '',
                'courses' => [], 'series' => [], 'students' => [], 'ods' => [],
            ];
            foreach ([['courses', 'nome_curso'], ['series', 'nome_serie'], ['students', 'nome_aluno']] as [$target, $source]) {
                if ($row[$source] && !in_array($row[$source], $projects[$id][$target], true)) {
                    $projects[$id][$target][] = $row[$source];
                }
            }
            if ($row['numero_stand'] !== null) {
                $projects[$id]['stand'] = (int) $row['numero_stand'];
            }
            if ($row['numero_ods'] !== null) {
                $odsNumber = (int) $row['numero_ods'];
                $alreadyAdded = array_filter(
                    $projects[$id]['ods'],
                    fn(array $item): bool => $item['number'] === $odsNumber
                );
                if (!$alreadyAdded) {
                    $projects[$id]['ods'][] = [
                        'number' => $odsNumber,
                        'name' => $row['nome_ods'] ?? '',
                    ];
                }
            }
            if ($row['mapa_id'] && $row['elemento_mapa_id']) {
                $parts = array_filter([$row['local'], $row['numero_sala'], $row['bloco'] ? 'Bloco ' . $row['bloco'] : null]);
                $projects[$id]['location'] = [
                    'mapId' => $row['mapa_id'],
                    'elementId' => $row['elemento_mapa_id'],
                    'label' => implode(' ', $parts),
                ];
            }
        }
        return array_values(array_filter($projects, fn(array $p): bool => $this->matches($p, $filters)));
    }

    private function matches(array $project, array $filters): bool
    {
        $normalize = fn(string $value): string => mb_strtolower(iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value) ?: $value);
        $odsTerms = array_map(fn(array $item): string => $item['number'] . ' ' . $item['name'], $project['ods'] ?? []);
        $haystack = $normalize(implode(' ', [$project['name'], $project['description'], $project['shift'], isset($project['stand']) ? 'stand ' . $project['stand'] : '', ...$project['courses'], ...$project['series'], ...$project['students'], ...$odsTerms]));
        $query = $normalize(trim((string) ($filters['q'] ?? '')));
        return (!$query || str_contains($haystack, $query))
            && (empty($filters['course']) || in_array($filters['course'], $project['courses'], true))
            && (empty($filters['series']) || in_array($filters['series'], $project['series'], true))
            && (empty($filters['shift']) || $filters['shift'] === $project['shift'])
            && (empty($filters['stand']) || (string) ($project['stand'] ?? '') === (string) $filters['stand'])
            && (empty($filters['ods']) || in_array((int) $filters['ods'], array_column($project['ods'] ?? [], 'number'), true))
            && (empty($filters['mapId']) || ($project['location']['mapId'] ?? null) === $filters['mapId'])
            && (empty($filters['hasLocation']) || isset($project['location']));
    }
}
