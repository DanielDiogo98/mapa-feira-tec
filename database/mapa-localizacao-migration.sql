-- Execute somente quando o banco oficial for atualizado.
-- Esses identificadores ligam uma localização ao destino técnico de um mapa.
ALTER TABLE `localizacao`
  ADD COLUMN IF NOT EXISTS `mapa_id` varchar(80) DEFAULT NULL AFTER `andar`,
  ADD COLUMN IF NOT EXISTS `elemento_mapa_id` varchar(80) DEFAULT NULL AFTER `mapa_id`;

CREATE UNIQUE INDEX IF NOT EXISTS `uq_localizacao_destino_mapa`
  ON `localizacao` (`mapa_id`, `elemento_mapa_id`);

-- A localização já cadastrada no banco atual corresponde à Sala 2 do Bloco A.
UPDATE `localizacao`
SET `mapa_id` = 'bloco-a-salas', `elemento_mapa_id` = 'sala-02'
WHERE `id_localizacao` = 1;
