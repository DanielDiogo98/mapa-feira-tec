-- Execute depois de importar os grafos do pátio, Bloco A e Bloco B / 2º andar.
-- Cada operação só cadastra o portal quando os dois pontos já existem.

INSERT INTO `mapa_portais` (
  `mapa_origem_id`, `ponto_origem_id`,
  `mapa_destino_id`, `ponto_destino_id`, `descricao`
)
SELECT
  'patio-biblioteca-auditorio', origem.`id_ponto`,
  'bloco-a-salas', destino.`id_ponto`,
  'Escada do pátio para as salas do Bloco A'
FROM `mapa_pontos` origem
JOIN `mapa_pontos` destino
  ON destino.`mapa_id` = 'bloco-a-salas'
 AND destino.`elemento_mapa_id` = 'patio-das-salas'
WHERE origem.`mapa_id` = 'patio-biblioteca-auditorio'
  AND origem.`elemento_mapa_id` = 'escadas-bloco-a-salas'
ON DUPLICATE KEY UPDATE `descricao` = VALUES(`descricao`);

INSERT INTO `mapa_portais` (
  `mapa_origem_id`, `ponto_origem_id`,
  `mapa_destino_id`, `ponto_destino_id`, `descricao`
)
SELECT
  'patio-biblioteca-auditorio', origem.`id_ponto`,
  'bloco-b-andar-2', destino.`id_ponto`,
  'Escada do auditório para o segundo andar do Bloco B'
FROM `mapa_pontos` origem
JOIN `mapa_pontos` destino
  ON destino.`mapa_id` = 'bloco-b-andar-2'
 AND destino.`elemento_mapa_id` = 'escadas-acesso-patio'
WHERE origem.`mapa_id` = 'patio-biblioteca-auditorio'
  AND origem.`elemento_mapa_id` = 'escada-acesso-bloco-b'
ON DUPLICATE KEY UPDATE `descricao` = VALUES(`descricao`);
