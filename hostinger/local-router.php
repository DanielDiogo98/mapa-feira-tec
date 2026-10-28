<?php
declare(strict_types=1);
// Development only: php -S 127.0.0.1:4173 hostinger/local-router.php
$root = dirname(__DIR__) . '/dist-hostinger';
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/');
if (str_starts_with($path, '/api/')) {
    $_GET['route'] = substr($path, strlen('/api/'));
    require $root . '/mcm-api.php';
    return true;
}
if ($path === '/entrar/aluno' || $path === '/entrar/professor') {
    header('Location: /3F/' . ($path === '/entrar/aluno' ? 'aluno.html' : 'professor/login.php'), true, 307);
    return true;
}
if (preg_match('#^/(mapa|editor(?:/mapas|/patio|/bloco-b-andar-[12])?)/?$#D', $path)) $path = '/map-app.html';
if ($path === '/') $path = '/index.html';
if (str_starts_with($path, '/mcm-public/')) $path = substr($path, strlen('/mcm-public'));
$public = realpath($root . '/mcm-public');
$file = realpath($public . $path);
if (!$file || !str_starts_with($file, $public . DIRECTORY_SEPARATOR) || !is_file($file)) { http_response_code(404); echo 'Não encontrado.'; return true; }
$types = ['js'=>'text/javascript', 'css'=>'text/css', 'html'=>'text/html', 'svg'=>'image/svg+xml', 'json'=>'application/json', 'ttf'=>'font/ttf', 'png'=>'image/png', 'jpg'=>'image/jpeg', 'webp'=>'image/webp'];
header('Content-Type: ' . ($types[pathinfo($file, PATHINFO_EXTENSION)] ?? 'application/octet-stream'));
readfile($file);
return true;
