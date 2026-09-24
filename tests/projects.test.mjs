import test from 'node:test';
import assert from 'node:assert/strict';
import { filterProjects, projectFilterOptions } from '../lib/projects.ts';

const projects = [
  {
    id: 1,
    name: 'CoroaAfro',
    description: 'Agência digital de marketing',
    shift: 'Manhã',
    courses: ['Informática para Internet', 'Administração'],
    series: ['3°C', '3°A'],
    students: ['Felipe', 'Daniel'],
    stand: 1,
    ods: [],
  },
  {
    id: 2,
    name: 'Valid',
    description: 'Autenticação de documentos',
    shift: 'Manhã',
    courses: [],
    series: [],
    students: [],
    ods: [],
  },
  {
    id: 3,
    name: 'ShowMe',
    description: 'Acesso à cultura',
    shift: 'Manhã',
    courses: [],
    series: [],
    students: [],
    ods: [],
  },
];

const blank = {
  query: '',
  course: '',
  series: '',
  shift: '',
  stand: '',
  ods: '',
};

test('project search ignores accents and includes students and descriptions', () => {
  assert.equal(
    filterProjects(projects, { ...blank, query: 'coroa afro' })[0].id,
    1,
  );
  assert.equal(
    filterProjects(projects, { ...blank, query: 'agencia digital' })[0].id,
    1,
  );
  assert.equal(
    filterProjects(projects, { ...blank, query: 'felipe' })[0].id,
    1,
  );
});

test('project filters combine course, series and shift', () => {
  assert.equal(
    filterProjects(projects, {
      query: '',
      course: 'Administração',
      series: '3°C',
      shift: 'Manhã',
      stand: '1',
      ods: '',
    }).length,
    1,
  );
  assert.equal(
    filterProjects(projects, {
      query: '',
      course: 'Química',
      series: '',
      shift: '',
      stand: '',
      ods: '',
    }).length,
    0,
  );
});

test('filter options are unique and sorted', () => {
  const options = projectFilterOptions(projects);
  assert.deepEqual(options.courses, [
    'Administração',
    'Informática para Internet',
  ]);
  assert.deepEqual(options.series, ['3°A', '3°C']);
  assert.deepEqual(options.shifts, ['Manhã']);
  assert.deepEqual(options.stands, [1]);
  assert.deepEqual(options.ods, []);
});

test('stand and ODS are searchable and filterable when supplied by the database', () => {
  const enriched = [
    {
      ...projects[0],
      stand: 12,
      ods: [{ number: 9, name: 'Indústria e inovação' }],
    },
  ];
  assert.equal(
    filterProjects(enriched, { ...blank, query: 'stand 12' }).length,
    1,
  );
  assert.equal(filterProjects(enriched, { ...blank, stand: '12' }).length, 1);
  assert.equal(filterProjects(enriched, { ...blank, ods: '9' }).length, 1);
});
