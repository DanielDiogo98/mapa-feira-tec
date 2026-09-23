<?php
declare(strict_types=1);

return [
    'database' => [
        'host' => getenv('DB_HOST') ?: getenv('MYSQLHOST') ?: '127.0.0.1',
        'port' => getenv('DB_PORT') ?: getenv('MYSQLPORT') ?: '3306',
        'name' => getenv('DB_NAME') ?: getenv('MYSQLDATABASE') ?: 'feira_tecnologica',
        'user' => getenv('DB_USER') ?: getenv('MYSQLUSER') ?: 'root',
        'password' => getenv('DB_PASSWORD') ?: getenv('MYSQLPASSWORD') ?: '',
    ],
    'allowed_origins' => array_filter([
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        ...(preg_split('/\s*,\s*/', getenv('FRONTEND_ORIGIN') ?: '', -1, PREG_SPLIT_NO_EMPTY) ?: []),
    ]),
    'graph_directory' => dirname(__DIR__) . DIRECTORY_SEPARATOR . 'lib',
];
