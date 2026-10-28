<?php
declare(strict_types=1);

// Opt-in integration tests. Never point this test at a production database.
$dsn = getenv('MCM_TEST_DSN') ?: '';
if (!preg_match('/^mysql:host=127\.0\.0\.1;port=\d+;dbname=mcm_test_[a-z0-9_]+;charset=utf8mb4$/D', $dsn)) {
    fwrite(STDERR, "Use MCM_TEST_DSN com MySQL local e banco mcm_test_*.\n"); exit(2);
}
require dirname(__DIR__) . '/hostinger/LiveProjectCatalog.php';
require dirname(__DIR__) . '/hostinger/VotingApi.php';
require dirname(__DIR__) . '/backend/src/ProjectCatalog.php';
date_default_timezone_set('America/Sao_Paulo');
$pdo = new PDO($dsn, 'root', '', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
$assertions = 0;
function check(bool $condition, string $message): void {
    global $assertions;
    if (!$condition) throw new RuntimeException($message);
    $assertions++;
}
function sourceFingerprint(PDO $pdo): array {
    $result = [];
    // Hash every original table, including private fields, without printing data.
    foreach ($pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN) as $table) {
        if (str_starts_with($table, 'mcm_')) continue;
        $rows = $pdo->query('SELECT * FROM `' . str_replace('`', '``', $table) . '`')->fetchAll(PDO::FETCH_ASSOC);
        $hashes = array_map(static fn(array $row): string => hash('sha256', serialize($row)), $rows);
        sort($hashes);
        $result[$table] = [count($rows), hash('sha256', implode('', $hashes))];
    }
    ksort($result);
    return $result;
}
$before = sourceFingerprint($pdo);
$locations = json_decode(file_get_contents(dirname(__DIR__) . '/lib/turma-locations.json'), true, flags: JSON_THROW_ON_ERROR);
$projects = (new LiveProjectCatalog($pdo, $locations))->all();
check(count($projects) > 0, 'Catálogo vazio.');
$catalog = new ProjectCatalog($projects);
$found = $catalog->search(['q' => 'Felipe José Borges de Mello']);
check(count($found) > 0, 'Busca por integrante falhou.');
$encoded = json_encode($projects, JSON_THROW_ON_ERROR);
foreach (['senha', 'senha_hash', 'senha_acesso', 'chave_acesso', 'email', 'rm', 'foto'] as $key) check(!str_contains($encoded, '"' . $key . '":'), 'Campo privado no catálogo: ' . $key);
$ids = array_column($projects, 'id');
check(count($ids) === count(array_unique($ids)), 'IDs de projeto duplicados.');
$api = new VotingApi($pdo, $projects, 'test-only-admin');
[$status] = $api->handle('GET', '/votos/meu-voto', []);
check($status === 401, 'Consulta sem sessão não foi recusada.');
$_COOKIE['visitante_id'] = '1';
[$status] = $api->handle('GET', '/votos/meu-voto', []);
check($status === 401, 'Cookie numérico forjado foi aceito.');
[$status] = $api->handle('PATCH', '/votacao/periodo', []);
check($status === 401, 'Admin sem token foi aceito.');
$disabled = new VotingApi($pdo, $projects);
[$status] = $disabled->handle('POST', '/votacao/encerrar', []);
check($status === 503, 'Admin sem configuração foi habilitado.');
$_SERVER['HTTP_X_ADMIN_TOKEN'] = 'test-only-admin';
[$status] = $api->handle('PATCH', '/votacao/periodo', ['data_inicio' => 'invalid', 'data_encerramento' => 'invalid']);
check($status === 422, 'Datas inválidas foram aceitas.');
[$status] = $api->handle('PATCH', '/votacao/periodo', ['data_inicio' => date(DATE_ATOM, time() - 3600), 'data_encerramento' => date(DATE_ATOM, time() + 3600), 'andamento' => true]);
check($status === 200, 'Não abriu o período local.');
[$status, $statusBody] = $api->handle('GET', '/votacao/status', []);
check($status === 200 && $statusBody['aberto'] === true, 'Período aberto não reconhecido.');
$token = bin2hex(random_bytes(32));
$pdo->prepare('INSERT INTO mcm_visitante (ip, modelo_dispositivo, token_hash) VALUES (?, ?, ?)')->execute(['127.0.0.1', 'test-only-browser', hash('sha256', $token)]);
$_COOKIE['mcm_visitor'] = $token;
$visitorId = (int) $pdo->lastInsertId();
[$status] = $api->handle('PUT', '/votos', ['id_projeto' => -1]);
check($status === 422, 'Projeto negativo foi aceito.');
[$status] = $api->handle('PUT', '/votos', ['id_projeto' => max($ids) + 10000]);
check($status === 404, 'Projeto inexistente foi aceito.');
[$status, $vote] = $api->handle('PUT', '/votos', ['id_projeto' => $ids[0]]);
check($status === 200 && $vote['voto']['id_projeto'] === $ids[0], 'Primeiro voto falhou.');
[$status, $vote] = $api->handle('PUT', '/votos', ['id_projeto' => $ids[1]]);
check($status === 200 && $vote['voto']['id_projeto'] === $ids[1], 'Troca de voto falhou.');
$query = $pdo->prepare('SELECT COUNT(*) FROM mcm_curtidas WHERE ativa = 1 AND id_visitante = ?'); $query->execute([$visitorId]);
check((int) $query->fetchColumn() === 1, 'Visitante ficou com votos ativos duplicados.');
[$status, $ranking] = $api->handle('GET', '/ranking', []);
check($status === 200 && count($ranking['ranking']) === count($projects), 'Ranking omitiu projetos sem voto.');
[$status] = $api->handle('DELETE', '/votos', []);
check($status === 200, 'Remoção do voto falhou.');
[$status] = $api->handle('GET', '/votos/meu-voto', []);
check($status === 404, 'Voto removido continua ativo.');
$api->handle('PUT', '/votos', ['id_projeto' => $ids[0]]);
[$status] = $api->handle('POST', '/votacao/encerrar', []);
check($status === 200, 'Encerramento falhou.');
[$status] = $api->handle('PUT', '/votos', ['id_projeto' => $ids[1]]);
check($status === 409, 'Voto após encerramento foi aceito.');
[$status] = $api->handle('DELETE', '/votos', []);
check($status === 409, 'Remoção após encerramento foi aceita.');
[$status, $final] = $api->handle('GET', '/ranking/resultado-final', []);
check($status === 200 && count($final['resultado_final']) > 0, 'Resultado final não persistiu.');
check($before === sourceFingerprint($pdo), 'DADOS DO CADASTRO ORIGINAL FORAM ALTERADOS.');
echo "OK: {$assertions} verificações; todas as tabelas de cadastro mantiveram hashes e quantidades.\n";
