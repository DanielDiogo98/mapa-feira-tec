<?php
declare(strict_types=1);

date_default_timezone_set('America/Sao_Paulo');
ini_set('display_errors', '0');
require __DIR__ . '/.mcm-private/LiveProjectCatalog.php';
require __DIR__ . '/.mcm-private/ProjectCatalog.php';
require __DIR__ . '/.mcm-private/VotingApi.php';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = '/' . trim((string) ($_GET['route'] ?? preg_replace('#^/api(?:/voting)?#', '', parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '')), '/');

function mcmRespond(array $data, int $status = 200): never {
    header_remove('Access-Control-Allow-Origin');
    header_remove('Access-Control-Allow-Credentials');
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    exit;
}

if ($method === 'OPTIONS') { header('Allow: GET, POST, PUT, DELETE, PATCH, OPTIONS'); http_response_code(204); exit; }
// This API is same-origin. Reject cross-site writes before any DB operation.
if (!in_array($method, ['GET', 'HEAD'], true) && !empty($_SERVER['HTTP_ORIGIN'])) {
    $originHost = parse_url($_SERVER['HTTP_ORIGIN'], PHP_URL_HOST);
    $host = explode(':', $_SERVER['HTTP_HOST'] ?? '')[0];
    if (!$originHost || strcasecmp($originHost, $host) !== 0) mcmRespond(['detail' => 'Origem não permitida.'], 403);
}
try {
    $config = require __DIR__ . '/.mcm-private/config.php';
    // Reuse the existing registration connection without changing its credentials
    // or schema. The private package contains no database password.
    require $config['source_config'];
    if (!isset($pdo) || !$pdo instanceof PDO) throw new RuntimeException('Conexão não configurada.');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->setAttribute(PDO::ATTR_STRINGIFY_FETCHES, false);
    $locations = json_decode(file_get_contents(__DIR__ . '/.mcm-private/turma-locations.json'), true, flags: JSON_THROW_ON_ERROR);
    if ($path === '/health' && $method === 'GET') {
        $pdo->query('SELECT 1')->fetchColumn();
        mcmRespond(['status' => 'ok', 'database' => 'ok', 'hosting' => 'hostinger']);
    }
    $projects = (new LiveProjectCatalog($pdo, $locations))->all();
    if ($path === '/projects' && $method === 'GET') mcmRespond(['data' => (new ProjectCatalog($projects))->search($_GET)]);
    if ($method === 'GET' && $path === '/maps') mcmRespond(['data' => $config['maps']]);
    if ($method === 'GET' && $path === '/portals') mcmRespond(['data' => json_decode(file_get_contents(__DIR__ . '/.mcm-private/map-portals.json'), true, flags: JSON_THROW_ON_ERROR)]);
    if ($method === 'GET' && preg_match('#^/maps/([a-z0-9-]+)/graph$#D', $path, $match)) {
        if (!in_array($match[1], array_column($config['maps'], 'id'), true)) mcmRespond(['error' => 'Mapa não encontrado.'], 404);
        mcmRespond(['data' => json_decode(file_get_contents(__DIR__ . '/.mcm-private/' . $match[1] . '-pontos.json'), true, flags: JSON_THROW_ON_ERROR)]);
    }
    $body = [];
    if (in_array($method, ['PUT', 'PATCH'], true)) {
        if (!str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) mcmRespond(['detail' => 'Envie um corpo JSON.'], 415);
        try { $body = json_decode(file_get_contents('php://input'), true, 32, JSON_THROW_ON_ERROR); }
        catch (JsonException) { mcmRespond(['detail' => 'JSON inválido.'], 422); }
        if (!is_array($body)) mcmRespond(['detail' => 'JSON inválido.'], 422);
    }
    [$status, $data] = (new VotingApi($pdo, $projects, $config['admin_token'] ?? ''))->handle($method, $path, $body);
    mcmRespond($data, $status);
} catch (Throwable $e) {
    error_log('MCM Expo API: ' . $e->getMessage());
    mcmRespond(['error' => 'A API está temporariamente indisponível.'], 503);
}
