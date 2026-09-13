CREATE TABLE IF NOT EXISTS `mapas` (
  `id_mapa` varchar(80) NOT NULL,
  `nome` varchar(120) NOT NULL,
  `largura` decimal(12,2) NOT NULL,
  `altura` decimal(12,2) NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_mapa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `mapa_pontos` (
  `mapa_id` varchar(80) NOT NULL,
  `id_ponto` varchar(80) NOT NULL,
  `nome` varchar(80) NOT NULL,
  `tipo` enum('corridor','door','destination','stairs','entrance') NOT NULL,
  `x` decimal(12,2) NOT NULL,
  `y` decimal(12,2) NOT NULL,
  `elemento_mapa_id` varchar(80) DEFAULT NULL,
  PRIMARY KEY (`mapa_id`, `id_ponto`),
  KEY `idx_mapa_pontos_elemento` (`mapa_id`, `elemento_mapa_id`),
  CONSTRAINT `fk_mapa_pontos_mapa` FOREIGN KEY (`mapa_id`) REFERENCES `mapas` (`id_mapa`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `mapa_conexoes` (
  `mapa_id` varchar(80) NOT NULL,
  `id_conexao` varchar(80) NOT NULL,
  `ponto_origem_id` varchar(80) NOT NULL,
  `ponto_destino_id` varchar(80) NOT NULL,
  PRIMARY KEY (`mapa_id`, `id_conexao`),
  UNIQUE KEY `uq_mapa_conexao_sentido` (`mapa_id`, `ponto_origem_id`, `ponto_destino_id`),
  CONSTRAINT `fk_mapa_conexao_origem` FOREIGN KEY (`mapa_id`, `ponto_origem_id`) REFERENCES `mapa_pontos` (`mapa_id`, `id_ponto`) ON DELETE CASCADE,
  CONSTRAINT `fk_mapa_conexao_destino` FOREIGN KEY (`mapa_id`, `ponto_destino_id`) REFERENCES `mapa_pontos` (`mapa_id`, `id_ponto`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `mapa_portais` (
  `id_portal` int unsigned NOT NULL AUTO_INCREMENT,
  `mapa_origem_id` varchar(80) NOT NULL,
  `ponto_origem_id` varchar(80) NOT NULL,
  `mapa_destino_id` varchar(80) NOT NULL,
  `ponto_destino_id` varchar(80) NOT NULL,
  `descricao` varchar(120) NOT NULL,
  PRIMARY KEY (`id_portal`),
  UNIQUE KEY `uq_mapa_portal` (`mapa_origem_id`, `ponto_origem_id`, `mapa_destino_id`, `ponto_destino_id`),
  CONSTRAINT `fk_mapa_portal_origem` FOREIGN KEY (`mapa_origem_id`, `ponto_origem_id`) REFERENCES `mapa_pontos` (`mapa_id`, `id_ponto`) ON DELETE CASCADE,
  CONSTRAINT `fk_mapa_portal_destino` FOREIGN KEY (`mapa_destino_id`, `ponto_destino_id`) REFERENCES `mapa_pontos` (`mapa_id`, `id_ponto`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `mapas` (`id_mapa`, `nome`, `largura`, `altura`) VALUES
('patio-biblioteca-auditorio', 'Pátio · Biblioteca · Auditório', 19062, 24297),
('bloco-a-salas', 'Bloco A · Salas', 12861, 42113),
('bloco-b-andar-1', 'Bloco B · 1º andar', 7363, 9312),
('bloco-b-andar-2', 'Bloco B · 2º andar', 7363, 14270)
ON DUPLICATE KEY UPDATE `nome`=VALUES(`nome`), `largura`=VALUES(`largura`), `altura`=VALUES(`altura`);
