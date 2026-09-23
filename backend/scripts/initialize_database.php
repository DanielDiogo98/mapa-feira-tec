<?php
declare(strict_types=1);

$config = require dirname(__DIR__) . '/config.example.php';
$database = $config['database'];
$pdo = new PDO(
    sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
        $database['host'],
        $database['port'],
        $database['name'],
    ),
    $database['user'],
    $database['password'],
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::MYSQL_ATTR_MULTI_STATEMENTS => true,
    ],
);

$exists = $pdo->query(
    "SELECT COUNT(*) FROM information_schema.tables " .
    "WHERE table_schema = DATABASE() AND table_name = 'mapas'"
)->fetchColumn();

if ((int) $exists > 0) {
    fwrite(STDOUT, "Banco da feira já inicializado.\n");
    exit(0);
}

$file = dirname(__DIR__, 2) . '/database/railway-init.sql';
$sql = file_get_contents($file);
if ($sql === false) {
    throw new RuntimeException('Arquivo de inicialização do banco não encontrado.');
}

$pdo->exec($sql);
fwrite(STDOUT, "Banco da Feira Tecnológica inicializado.\n");
