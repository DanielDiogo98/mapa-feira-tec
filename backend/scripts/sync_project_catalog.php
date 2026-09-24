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
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION],
);

$catalogFile = dirname(__DIR__, 2) . '/lib/projects-data.json';
$contents = file_get_contents($catalogFile);
if ($contents === false) {
    throw new RuntimeException('Catálogo público de projetos não encontrado.');
}
$projects = json_decode($contents, true, flags: JSON_THROW_ON_ERROR);

$columnExists = $pdo->prepare(
    <<<'SQL'
SELECT COUNT(*)
FROM information_schema.columns
WHERE table_schema = DATABASE()
  AND table_name = 'projetos'
  AND column_name = 'catalogo_publico'
SQL,
);
$columnExists->execute();
if ((int) $columnExists->fetchColumn() === 0) {
    $pdo->exec(
        'ALTER TABLE projetos ' .
        'ADD COLUMN catalogo_publico tinyint(1) NOT NULL DEFAULT 0 AFTER turno',
    );
}

$upsert = $pdo->prepare(
    <<<'SQL'
INSERT INTO projetos (id_projeto, nome_projeto, descricao, turno, catalogo_publico)
VALUES (:id, :name, :description, :shift, 1)
ON DUPLICATE KEY UPDATE
    nome_projeto = VALUES(nome_projeto),
    descricao = VALUES(descricao),
    turno = VALUES(turno),
    catalogo_publico = 1
SQL,
);

$pdo->beginTransaction();
try {
    $pdo->exec('UPDATE projetos SET catalogo_publico = 0');
    foreach ($projects as $project) {
        $upsert->execute([
            'id' => (int) $project['id'],
            'name' => (string) $project['name'],
            'description' => (string) ($project['description'] ?? ''),
            'shift' => (string) ($project['shift'] ?? ''),
        ]);
    }
    $pdo->commit();
} catch (Throwable $error) {
    $pdo->rollBack();
    throw $error;
}

fwrite(STDOUT, sprintf("Catálogo de projetos sincronizado: %d registros.\n", count($projects)));
