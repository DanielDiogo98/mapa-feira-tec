<?php
declare(strict_types=1);

/** Reads only public fields from the registration database; never copies users. */
final class LiveProjectCatalog
{
    public function __construct(private PDO $pdo, private array $locations) {}

    public function all(): array
    {
        // A consistent read includes the leader even when aluno_projeto is incomplete.
        $this->pdo->beginTransaction();
        try {
            $projects = $this->pdo->query('SELECT id, nome, descricao, periodo, orientador_id, ods, id_aluno FROM projeto ORDER BY id')->fetchAll(PDO::FETCH_ASSOC);
            $students = $this->pdo->query('SELECT id, nome, curso, turma FROM aluno')->fetchAll(PDO::FETCH_UNIQUE | PDO::FETCH_ASSOC);
            $teachers = $this->pdo->query('SELECT id, nome FROM professor')->fetchAll(PDO::FETCH_KEY_PAIR);
            $links = $this->pdo->query('SELECT id_projeto, id_aluno FROM aluno_projeto')->fetchAll(PDO::FETCH_ASSOC);
            $extra = $this->pdo->query('SELECT id_projeto, turma, curso FROM projeto_turma')->fetchAll(PDO::FETCH_ASSOC);
            $this->pdo->commit();
        } catch (Throwable $e) {
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            throw $e;
        }
        return self::assemble($projects, $students, $teachers, $links, $extra, $this->locations);
    }

    public static function turmaKey(string $value): string
    {
        return mb_strtoupper((string) preg_replace('/[\sº°ª]/u', '', trim($value)), 'UTF-8');
    }

    public static function assemble(array $projects, array $students, array $teachers, array $links, array $extra, array $locations): array
    {
        $members = [];
        foreach ($links as $link) $members[(int) $link['id_projeto']][(int) $link['id_aluno']] = true;
        $overrides = [];
        foreach ($extra as $row) $overrides[(int) $row['id_projeto']][] = $row;
        $result = [];
        foreach ($projects as $project) {
            $name = trim((string) $project['nome']);
            if (preg_match('/^teste(?:\b|\d)/iu', $name)) continue;
            $id = (int) $project['id'];
            $memberIds = $members[$id] ?? [];
            if (!empty($project['id_aluno'])) $memberIds[(int) $project['id_aluno']] = true;
            $names = $courses = $turmas = [];
            foreach (array_keys($memberIds) as $studentId) {
                if (!isset($students[$studentId])) continue;
                $student = $students[$studentId];
                if (trim($student['nome'] ?? '') !== '') $names[] = trim($student['nome']);
                if (trim($student['curso'] ?? '') !== '') $courses[] = trim($student['curso']);
                if (trim($student['turma'] ?? '') !== '') $turmas[] = self::turmaKey($student['turma']);
            }
            // A project in an additional class must use that class's room.
            if (isset($overrides[$id])) {
                $turmas = array_map(static fn(array $row): string => self::turmaKey((string) $row['turma']), $overrides[$id]);
                $courses = array_column($overrides[$id], 'curso');
            }
            $unique = static function(array $values): array {
                $values = array_values(array_unique(array_filter($values, static fn($v) => $v !== null && $v !== '')));
                sort($values, SORT_STRING);
                return $values;
            };
            $turmas = $unique($turmas);
            $item = [
                'id' => $id, 'name' => $name, 'description' => trim((string) ($project['descricao'] ?? '')),
                'shift' => ['matutino' => 'Manhã', 'vespertino' => 'Tarde', 'noturno' => 'Noite'][$project['periodo']] ?? $project['periodo'],
                'courses' => $unique($courses),
                'series' => array_map(static fn(string $t): string => (string) preg_replace('/^(\d+)([A-Z]+)$/', '$1º$2', $t), $turmas),
                'students' => $unique($names), 'ods' => [],
            ];
            foreach (explode('|', (string) ($project['ods'] ?? '')) as $part) {
                if (preg_match('/^\s*(\d+)\s*[·-]\s*(.+?)\s*$/u', $part, $m)) $item['ods'][] = ['number' => (int) $m[1], 'name' => $m[2]];
            }
            if (isset($teachers[$project['orientador_id']])) $item['advisor'] = $teachers[$project['orientador_id']];
            $mapped = [];
            foreach ($turmas as $turma) if (isset($locations[$turma])) $mapped[json_encode($locations[$turma])] = $locations[$turma];
            if (count($mapped) === 1) $item['location'] = array_values($mapped)[0];
            $result[] = $item;
        }
        usort($result, static fn(array $a, array $b): int => strnatcasecmp($a['name'], $b['name']));
        return $result;
    }
}
