-- Additive only: no changes to aluno, projeto, professor or their associations.
CREATE TABLE IF NOT EXISTS mcm_visitante (
  id_visitante INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ip VARCHAR(45) NOT NULL,
  modelo_dispositivo VARCHAR(255) NOT NULL,
  token_hash CHAR(64) NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS mcm_periodo_votacao (
  id_periodo INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  data_inicio DATETIME NOT NULL,
  data_encerramento DATETIME NOT NULL,
  andamento TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS mcm_curtidas (
  id_curtida INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ativa TINYINT(1) NOT NULL DEFAULT 1,
  data_curtida DATETIME NOT NULL,
  id_visitante INT UNSIGNED NOT NULL,
  id_projeto INT UNSIGNED NOT NULL,
  id_periodo INT UNSIGNED NOT NULL,
  INDEX visitante_ativo (id_visitante, ativa),
  INDEX projeto_ativo (id_projeto, ativa),
  CONSTRAINT mcm_curtida_visitante FOREIGN KEY (id_visitante) REFERENCES mcm_visitante(id_visitante),
  CONSTRAINT mcm_curtida_periodo FOREIGN KEY (id_periodo) REFERENCES mcm_periodo_votacao(id_periodo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS mcm_resultado (
  id_resultado INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  posicao INT UNSIGNED NOT NULL,
  quantidade_curtidas INT UNSIGNED NOT NULL,
  data_resultado DATETIME NOT NULL,
  id_projeto INT UNSIGNED NOT NULL,
  UNIQUE KEY projeto_data (id_projeto, data_resultado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
