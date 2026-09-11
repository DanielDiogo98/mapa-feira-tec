<?php
declare(strict_types=1);

return [
    'database' => [
        'host' => getenv('DB_HOST') ?: '127.0.0.1',
        'port' => getenv('DB_PORT') ?: '3306',
        'name' => getenv('DB_NAME') ?: 'feira-tecnologica-2026-turma-a',
        'user' => getenv('DB_USER') ?: 'root',
        'password' => getenv('DB_PASSWORD') ?: '',
    ],
    'allowed_origins' => array_filter([
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        getenv('FRONTEND_ORIGIN') ?: null,
    ]),
    'graph_directory' => dirname(__DIR__) . DIRECTORY_SEPARATOR . 'lib',
];
