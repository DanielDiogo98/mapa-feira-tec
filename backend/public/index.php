<?php
declare(strict_types=1);

$configFile = dirname(__DIR__) . '/config.php';
$config = require file_exists($configFile) ? $configFile : dirname(__DIR__) . '/config.example.php';
require dirname(__DIR__) . '/src/Database.php';
require dirname(__DIR__) . '/src/ProjectRepository.php';
require dirname(__DIR__) . '/src/ProjectCatalog.php';

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $config['allowed_origins'], true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

function respond(mixed $data, int $status = 200): never {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

try {
    $path = '/' . trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/', '/');
    $path = preg_replace('#^/api#', '', $path) ?: '/';
    if ($path === '/health') respond(['status' => 'ok', 'time' => gmdate(DATE_ATOM)]);
    if ($path === '/projects') {
        $catalogFile = dirname(__DIR__, 2) . '/lib/projects-data.json';
        if (is_file($catalogFile)) {
            respond(['data' => ProjectCatalog::fromJson($catalogFile)->search($_GET)]);
        }
        $pdo = Database::connect($config['database']);
        respond(['data' => (new ProjectRepository($pdo))->search($_GET)]);
    }
    if ($path === '/maps') {
        respond(['data' => [
            ['id' => 'patio-biblioteca-auditorio', 'name' => 'Pátio · Biblioteca · Auditório', 'width' => 19062, 'height' => 24297, 'status' => 'ready'],
            ['id' => 'bloco-a-salas', 'name' => 'Bloco A · Salas', 'width' => 12861, 'height' => 42113, 'status' => 'ready'],
            ['id' => 'bloco-b-andar-1', 'name' => 'Bloco B · 1º andar', 'width' => 7363, 'height' => 13163, 'status' => 'ready'],
            ['id' => 'bloco-b-andar-2', 'name' => 'Bloco B · 2º andar', 'width' => 20498, 'height' => 19301, 'status' => 'ready'],
        ]]);
    }
    if ($path === '/portals') {
        $file = $config['graph_directory'] . DIRECTORY_SEPARATOR . 'map-portals.json';
        respond(['data' => json_decode(file_get_contents($file), true, flags: JSON_THROW_ON_ERROR)]);
    }
    if (preg_match('#^/maps/([a-z0-9-]+)/graph$#', $path, $match)) {
        $allowed = [
            'bloco-a-salas',
            'patio-biblioteca-auditorio',
            'bloco-b-andar-1',
            'bloco-b-andar-2',
        ];
        if (!in_array($match[1], $allowed, true)) respond(['error' => 'Grafo ainda não cadastrado.'], 404);
        $file = $config['graph_directory'] . DIRECTORY_SEPARATOR . $match[1] . '-pontos.json';
        if (!is_file($file)) respond(['error' => 'Grafo não encontrado.'], 404);
        respond(['data' => json_decode(file_get_contents($file), true, flags: JSON_THROW_ON_ERROR)]);
    }
    respond(['error' => 'Rota não encontrada.'], 404);
} catch (Throwable $error) {
    error_log($error->__toString());
    respond(['error' => 'Não foi possível concluir a solicitação.'], 500);
}
