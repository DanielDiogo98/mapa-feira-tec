<?php
declare(strict_types=1);

final class ProjectCatalog
{
    /** @param list<array<string, mixed>> $projects */
    public function __construct(private array $projects) {}

    public static function fromJson(string $file): self
    {
        $contents = file_get_contents($file);
        if ($contents === false) {
            throw new RuntimeException('Catálogo público de projetos não encontrado.');
        }
        $projects = json_decode($contents, true, flags: JSON_THROW_ON_ERROR);
        if (!is_array($projects)) {
            throw new RuntimeException('Catálogo público de projetos inválido.');
        }
        return new self($projects);
    }

    public function search(array $filters): array
    {
        return array_values(array_filter(
            $this->projects,
            fn(array $project): bool => $this->matches($project, $filters),
        ));
    }

    private function matches(array $project, array $filters): bool
    {
        $normalize = static fn(string $value): string => mb_strtolower(
            iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value) ?: $value,
        );
        $odsTerms = array_map(
            static fn(array $item): string => ($item['number'] ?? '') . ' ' . ($item['name'] ?? ''),
            $project['ods'] ?? [],
        );
        $haystack = $normalize(implode(' ', [
            $project['name'] ?? '',
            $project['description'] ?? '',
            $project['shift'] ?? '',
            isset($project['stand']) ? 'stand ' . $project['stand'] : '',
            ...($project['courses'] ?? []),
            ...($project['series'] ?? []),
            ...($project['students'] ?? []),
            $project['advisor'] ?? '',
            ...$odsTerms,
        ]));
        $query = $normalize(trim((string) ($filters['q'] ?? '')));
        return (!$query || str_contains($haystack, $query))
            && (empty($filters['course']) || in_array($filters['course'], $project['courses'] ?? [], true))
            && (empty($filters['series']) || in_array($filters['series'], $project['series'] ?? [], true))
            && (empty($filters['shift']) || $filters['shift'] === ($project['shift'] ?? ''))
            && (empty($filters['stand']) || (string) ($project['stand'] ?? '') === (string) $filters['stand'])
            && (empty($filters['ods']) || in_array((int) $filters['ods'], array_column($project['ods'] ?? [], 'number'), true))
            && (empty($filters['mapId']) || ($project['location']['mapId'] ?? null) === $filters['mapId'])
            && (empty($filters['hasLocation']) || isset($project['location']));
    }
}
