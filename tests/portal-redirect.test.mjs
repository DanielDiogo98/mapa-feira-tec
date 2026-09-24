import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const accessPage = new URL(
  '../public/pages/Tipo_visitante/tipo_visitante.html',
  import.meta.url,
);

test('botões de aluno e professor usam os redirecionamentos configuráveis', async () => {
  const html = await readFile(accessPage, 'utf8');

  assert.match(html, /href="\/entrar\/aluno"/);
  assert.match(html, /href="\/entrar\/professor"/);
  assert.doesNotMatch(html, /<button class="btn-entrar">/);
});
