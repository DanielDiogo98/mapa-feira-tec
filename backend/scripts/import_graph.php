<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli' || $argc !== 2) {
    fwrite(STDERR, "Uso: php import_graph.php caminho-do-mapa-pontos.json\n"); exit(1);
}
$configFile = dirname(__DIR__) . '/config.php';
$config = require file_exists($configFile) ? $configFile : dirname(__DIR__) . '/config.example.php';
require dirname(__DIR__) . '/src/Database.php';
$graph = json_decode(file_get_contents($argv[1]), true, flags: JSON_THROW_ON_ERROR);
if (($graph['version'] ?? null) !== 1 || empty($graph['mapId']) || !is_array($graph['nodes'] ?? null) || !is_array($graph['edges'] ?? null)) {
    throw new RuntimeException('Arquivo de grafo inválido.');
}
$pdo = Database::connect($config['database']);
$pdo->beginTransaction();
try {
    $pdo->prepare('INSERT INTO mapas (id_mapa, nome, largura, altura) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE largura=VALUES(largura), altura=VALUES(altura)')
        ->execute([$graph['mapId'], $graph['mapId'], $graph['width'], $graph['height']]);
    $pdo->prepare('DELETE FROM mapa_conexoes WHERE mapa_id = ?')->execute([$graph['mapId']]);
    $pdo->prepare('DELETE FROM mapa_pontos WHERE mapa_id = ?')->execute([$graph['mapId']]);
    $point = $pdo->prepare('INSERT INTO mapa_pontos (mapa_id, id_ponto, nome, tipo, x, y, elemento_mapa_id) VALUES (?, ?, ?, ?, ?, ?, ?)');
    foreach ($graph['nodes'] as $node) $point->execute([$graph['mapId'], $node['id'], $node['label'], $node['kind'], $node['x'], $node['y'], $node['elementId'] ?? null]);
    $edge = $pdo->prepare('INSERT INTO mapa_conexoes (mapa_id, id_conexao, ponto_origem_id, ponto_destino_id) VALUES (?, ?, ?, ?)');
    foreach ($graph['edges'] as $link) $edge->execute([$graph['mapId'], $link['id'], $link['from'], $link['to']]);

    $portalFile = $config['graph_directory'] . DIRECTORY_SEPARATOR . 'map-portals.json';
    if (is_file($portalFile)) {
        $portals = json_decode(file_get_contents($portalFile), true, flags: JSON_THROW_ON_ERROR);
        $findPoint = $pdo->prepare('SELECT id_ponto FROM mapa_pontos WHERE mapa_id = ? AND elemento_mapa_id = ? LIMIT 1');
        $savePortal = $pdo->prepare(
            'INSERT INTO mapa_portais (mapa_origem_id, ponto_origem_id, mapa_destino_id, ponto_destino_id, descricao) VALUES (?, ?, ?, ?, ?) '
            . 'ON DUPLICATE KEY UPDATE descricao=VALUES(descricao)'
        );
        foreach ($portals as $portal) {
            $findPoint->execute([$portal['from']['mapId'], $portal['from']['elementId']]);
            $fromPoint = $findPoint->fetchColumn();
            $findPoint->execute([$portal['to']['mapId'], $portal['to']['elementId']]);
            $toPoint = $findPoint->fetchColumn();
            if ($fromPoint && $toPoint) {
                $savePortal->execute([
                    $portal['from']['mapId'], $fromPoint,
                    $portal['to']['mapId'], $toPoint,
                    $portal['label'],
                ]);
            }
        }
    }
    $pdo->commit();
    fwrite(STDOUT, sprintf("%s: %d pontos e %d conexões importados.\n", $graph['mapId'], count($graph['nodes']), count($graph['edges'])));
} catch (Throwable $error) { $pdo->rollBack(); throw $error; }
