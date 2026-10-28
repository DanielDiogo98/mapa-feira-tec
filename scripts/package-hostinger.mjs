import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const out = resolve('dist-hostinger');
const privateDir = resolve(out, '.mcm-private');
await mkdir(privateDir, { recursive: true });
for (const name of ['LiveProjectCatalog.php', 'VotingApi.php', 'config.php']) await cp(resolve('hostinger', name), resolve(privateDir, name));
await cp('backend/src/ProjectCatalog.php', resolve(privateDir, 'ProjectCatalog.php'));
for (const name of ['turma-locations', 'map-portals', 'bloco-a-salas-pontos', 'bloco-b-andar-1-pontos', 'bloco-b-andar-2-pontos', 'patio-biblioteca-auditorio-pontos']) {
  await cp(`lib/${name}.json`, resolve(privateDir, `${name}.json`));
}
await writeFile(resolve(privateDir, '.htaccess'), 'Require all denied\n');
await cp('hostinger/api.php', resolve(out, 'mcm-api.php'));
await cp('hostinger/root.htaccess', resolve(out, '.htaccess'));
// Site pages retain their current URLs. Static assets inside the React bundle
// are served with a namespaced base, so they cannot shadow registration assets.
const html = await readFile(resolve(out, 'mcm-public/map-app.html'), 'utf8');
if (!html.includes('/mcm-public/assets/')) throw new Error('Build sem base estática correta.');
console.log(`Pacote Hostinger pronto em ${out}; nenhum arquivo de cadastro ou backup SQL está incluído.`);
