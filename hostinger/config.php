<?php
declare(strict_types=1);
return [
    'source_config' => getenv('MCM_SOURCE_CONFIG') ?: dirname(__DIR__) . '/3F/api/config/database.php',
    'admin_token' => getenv('MCM_ADMIN_TOKEN') ?: '',
    'maps' => [
        ['id' => 'patio-biblioteca-auditorio', 'name' => 'Pátio · Biblioteca · Auditório', 'width' => 19062, 'height' => 24297, 'status' => 'ready'],
        ['id' => 'bloco-a-salas', 'name' => 'Bloco A · Salas', 'width' => 12861, 'height' => 42113, 'status' => 'ready'],
        ['id' => 'bloco-b-andar-1', 'name' => 'Bloco B · 1º andar', 'width' => 7363, 'height' => 13163, 'status' => 'ready'],
        ['id' => 'bloco-b-andar-2', 'name' => 'Bloco B · 2º andar', 'width' => 20498, 'height' => 19301, 'status' => 'ready'],
    ],
];
