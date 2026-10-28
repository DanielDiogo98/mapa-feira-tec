import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

test('data passada no contador não impede carregar projetos e estatísticas', async () => {
  const code = await readFile(new URL('../public/Index-home.js', import.meta.url), 'utf8');
  const elements = new Map();
  const requested = [];
  const errors = [];
  const cleared = [];
  const document = {
    addEventListener(_name, callback) { callback(); },
    getElementById(id) {
      if (id === 'menuToggle' || id === 'mainMenu') return null;
      if (!elements.has(id)) elements.set(id, { textContent: '', classList: { add() {}, remove() {} } });
      return elements.get(id);
    },
    querySelectorAll() { return []; },
  };
  class PastDate extends Date {
    constructor(...args) { super(...(args.length ? args : ['2026-10-28T12:00:00-03:00'])); }
  }
  runInNewContext(code, {
    document, window: {}, Date: PastDate,
    setInterval() { return 123; }, clearInterval(id) { cleared.push(id); },
    console: { error(...args) { errors.push(args); } },
    async fetch(url) {
      requested.push(url);
      return { ok: true, async json() { return url === '/api/projects' ? { data: [{ id: 1, name: 'Projeto', location: {}, students: ['Aluno'], ods: [], courses: [] }] } : { ranking: [] }; } };
    },
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(requested, ['/api/projects', '/api/ranking']);
  assert.deepEqual(cleared, [123]);
  assert.equal(elements.get('project-count').textContent, '1');
  assert.equal(elements.get('student-count').textContent, '1');
  assert.equal(errors.length, 0);
});
