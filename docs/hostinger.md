# Publicação na Hostinger Single

O site de visitantes, mapa, cadastro de alunos e área de professores usam
`https://etecmcmexpo.com.br`. O antigo subdomínio `sistema` encaminha os
endereços para o domínio principal.

## Estrutura

- `mcm-public/`: HTML/CSS originais do site e mapa React compilado com Vite;
- `mcm-api.php`: API no mesmo domínio, sem Node ou Python em produção;
- `.mcm-private/`: classes e configuração PHP, bloqueadas por `.htaccess`;
- `.htaccess`: rotas públicas e redirecionamentos, preservando arquivos físicos
  como `/3F/aluno.html`, `/3F/professor/login.php` e APIs `.php` existentes.

O adaptador de conexão reutiliza `3F/api/config/database.php` da instalação
atual. Esse arquivo não faz parte do pacote de publicação e suas credenciais
não devem ser copiadas ao GitHub. `MCM_SOURCE_CONFIG` permite apontar para
outra configuração em um ambiente de desenvolvimento.

## Dados

`LiveProjectCatalog` consulta apenas os campos públicos de `projeto`, `aluno`,
`aluno_projeto`, `professor` e `projeto_turma`. Não é necessário importar um
dump antigo ou executar `database/railway-init.sql` na Hostinger. O catálogo
reflete os cadastros novos a cada consulta, inclui o líder mesmo se faltar seu
vínculo em `aluno_projeto` e respeita a turma específica de `projeto_turma`.
RM, e-mail, senhas, fotos e chaves de acesso não são retornados pela API.

A votação usa somente quatro tabelas adicionais: `mcm_visitante`,
`mcm_periodo_votacao`, `mcm_curtidas` e `mcm_resultado`. O esquema em
`hostinger/voting-schema.sql` é aditivo e não modifica as tabelas do sistema
de cadastro. O backend original da Turma B fica preservado em
`backend-turma-b/`; `VotingApi.php` mantém os contratos usados pelas páginas.

Cookies de visitante possuem identificador aleatório, HttpOnly e SameSite;
votos são atualizados em transações com bloqueio do visitante e do período.
Visitantes na mesma rede não são agrupados só pelo IP.

## Construir e publicar

```powershell
npm ci
npm run check
npm run build:hostinger
```

Envie o conteúdo de `dist-hostinger/` para `public_html`, conservando as
pastas já existentes `3F`, `3C`, `api` e os arquivos do sistema. O pacote
contém os próprios diretórios, não contém usuários completos, backups ou
credenciais. Faça backup antes de atualizar os arquivos da aplicação.

Em uma instalação nova, aplique uma única vez `hostinger/voting-schema.sql`
pelo phpMyAdmin. Não habilite votação por padrão. O período deve ser definido
pelo responsável com as datas corretas. As rotas administrativas
`PATCH /api/votacao/periodo` e `POST /api/votacao/encerrar` exigem um
`X-Admin-Token` correspondente a `MCM_ADMIN_TOKEN` (ou à opção privada
`admin_token`). Sem essa configuração elas retornam 503. Nunca coloque o
token no JavaScript do navegador ou no repositório.

## Validação

- `npm run check`: tipagem e testes dos grafos, busca, privacidade e home;
- `tests/hostinger-integration.php`: testes reais da API PHP, somente em
  MySQL local com banco cujo nome começa com `mcm_test_`;
- `hostinger/local-router.php`: prévia local do pacote, sem fazer parte do ZIP.

Exemplo de execução dos testes PHP, após restaurar um backup em banco local
descartável e aplicar o esquema de votação:

```powershell
$env:MCM_TEST_DSN='mysql:host=127.0.0.1;port=3309;dbname=mcm_test_20261028;charset=utf8mb4'
php tests/hostinger-integration.php
```

Em 28/10/2026 foram salvos backups SQL antes e depois da migração e um ZIP dos
arquivos existentes, fora do repositório e da pasta pública. A comparação
confirmou que todas as 19 tabelas originais conservaram seus registros:
629 alunos, 135 projetos, 622 vínculos aluno–projeto e 76 professores.
O catálogo exibe 134 projetos; o projeto de teste permanece no banco.

O usuário confirmou que havia apenas votos de teste na Railway, sem votos
reais a migrar. A votação nova foi publicada fechada, sem período definido.
A conta Railway não é necessária para executar este site na Hostinger.

## Conferências depois de uma atualização

Verifique `/api/health`, `/api/projects`, `/api/ranking`,
`/api/votacao/status`, `/mapa` e os dois caminhos `/entrar/…`.
Confirme que `/.mcm-private/config.php` retorna 403 e que os cadastros e os
vínculos continuam íntegros. A consulta de saúde testa de fato a conexão
com o banco. Não use o fallback JSON do mapa como prova de integridade.
