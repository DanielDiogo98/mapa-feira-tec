export type ProjectLocation = {
  mapId: string;
  elementId: string;
  label: string;
};

export type FairProject = {
  id: number;
  name: string;
  description: string;
  shift: string;
  courses: string[];
  series: string[];
  students: string[];
  stand?: number;
  ods?: Array<{ number: number; name: string }>;
  location?: ProjectLocation;
};

export type ProjectFilters = {
  query: string;
  course: string;
  series: string;
  shift: string;
  stand: string;
  ods: string;
};

const searchable = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');
const compact = (value: string) => searchable(value).replace(/[^a-z0-9]/g, '');

export function filterProjects(
  projects: FairProject[],
  filters: ProjectFilters,
) {
  const query = searchable(filters.query.trim());
  return projects.filter((project) => {
    const text = searchable(
      [
        project.name,
        project.description,
        project.shift,
        ...project.courses,
        ...project.series,
        ...project.students,
        project.stand ? `stand ${project.stand}` : '',
        ...(project.ods ?? []).flatMap((item) => [
          String(item.number),
          item.name,
        ]),
      ].join(' '),
    );
    return (
      (!query ||
        text.includes(query) ||
        compact(text).includes(compact(query))) &&
      (!filters.course || project.courses.includes(filters.course)) &&
      (!filters.series || project.series.includes(filters.series)) &&
      (!filters.shift || project.shift === filters.shift) &&
      (!filters.stand || String(project.stand ?? '') === filters.stand) &&
      (!filters.ods ||
        (project.ods ?? []).some((item) => String(item.number) === filters.ods))
    );
  });
}

export function projectFilterOptions(projects: FairProject[]) {
  const unique = (values: string[]) =>
    [...new Set(values.filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, 'pt-BR'),
    );
  return {
    courses: unique(projects.flatMap((project) => project.courses)),
    series: unique(projects.flatMap((project) => project.series)),
    shifts: unique(projects.map((project) => project.shift)),
    stands: [
      ...new Set(projects.flatMap((project) => project.stand ?? [])),
    ].sort((a, b) => a - b),
    ods: [
      ...new Map(
        projects.flatMap((project) =>
          (project.ods ?? []).map((item) => [item.number, item] as const),
        ),
      ).values(),
    ].sort((a, b) => a.number - b.number),
  };
}
