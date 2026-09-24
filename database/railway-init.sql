-- Gerado por npm run db:build. Não edite manualmente.
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;

-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 02-Set-2026 às 15:28
-- Versão do servidor: 10.4.22-MariaDB
-- versão do PHP: 8.1.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `feira-tecnologica-2026-turma-a`
--


-- --------------------------------------------------------

--
-- Estrutura da tabela `alunos`
--

CREATE TABLE `alunos` (
  `id_aluno` int(11) NOT NULL,
  `nome_aluno` varchar(255) DEFAULT NULL,
  `fk_serie_id_serie` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Extraindo dados da tabela `alunos`
--

INSERT INTO `alunos` (`id_aluno`, `nome_aluno`, `fk_serie_id_serie`) VALUES
(1, 'Felipe', 1),
(2, 'Daniel', 1),
(3, 'Byanca', 1),
(4, 'João Vinícius', 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `alunos_projetos`
--

CREATE TABLE `alunos_projetos` (
  `fk_aluno_id_aluno` int(11) NOT NULL,
  `fk_projetos_id_projeto` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Extraindo dados da tabela `alunos_projetos`
--

INSERT INTO `alunos_projetos` (`fk_aluno_id_aluno`, `fk_projetos_id_projeto`) VALUES
(1, 1),
(2, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `curso`
--

CREATE TABLE `curso` (
  `id_curso` int(11) NOT NULL,
  `nome_curso` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Extraindo dados da tabela `curso`
--

INSERT INTO `curso` (`id_curso`, `nome_curso`) VALUES
(1, 'Informática para Internet'),
(2, 'Administração'),
(3, 'Recursos Humanos'),
(4, 'Química'),
(5, 'Logística'),
(6, 'Qualidade');

-- --------------------------------------------------------

--
-- Estrutura da tabela `curso_projetos`
--

CREATE TABLE `curso_projetos` (
  `fk_curso_id_curso` int(11) DEFAULT NULL,
  `fk_projetos_id_projeto` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Extraindo dados da tabela `curso_projetos`
--

INSERT INTO `curso_projetos` (`fk_curso_id_curso`, `fk_projetos_id_projeto`) VALUES
(1, 1),
(2, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `curtidas`
--

CREATE TABLE `curtidas` (
  `id_curtida` int(11) NOT NULL,
  `ativa` tinyint(1) NOT NULL,
  `data_curtida` datetime NOT NULL,
  `id_visitante` int(11) NOT NULL,
  `id_projeto` int(11) NOT NULL,
  `id_periodo` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estrutura da tabela `localizacao`
--

CREATE TABLE `localizacao` (
  `id_localizacao` int(11) NOT NULL,
  `local` varchar(255) DEFAULT NULL,
  `bloco` char(1) DEFAULT NULL,
  `numero_sala` int(11) DEFAULT NULL,
  `andar` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Extraindo dados da tabela `localizacao`
--

INSERT INTO `localizacao` (`id_localizacao`, `local`, `bloco`, `numero_sala`, `andar`) VALUES
(1, 'Sala', 'A', 2, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `localizacao_projetos`
--

CREATE TABLE `localizacao_projetos` (
  `fk_projetos_id_projeto` int(11) DEFAULT NULL,
  `fk_localizacao_id_localizacao` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Extraindo dados da tabela `localizacao_projetos`
--

INSERT INTO `localizacao_projetos` (`fk_projetos_id_projeto`, `fk_localizacao_id_localizacao`) VALUES
(1, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `ods`
--

CREATE TABLE `ods` (
  `numero_ods` int(11) NOT NULL,
  `nome` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Extraindo dados da tabela `ods`
--

INSERT INTO `ods` (`numero_ods`, `nome`) VALUES
(1, 'Erradicação da Pobreza'),
(2, 'Fome Zero e Agricultura Sustentável'),
(3, 'Saúde e Bem-Estar'),
(4, 'Educação de Qualidade'),
(5, 'Igualdade de Gênero'),
(6, 'Água Potável e Saneamento'),
(7, 'Energia Limpa e Acessível'),
(8, 'Trabalho Decente e Crescimento Econômico'),
(9, 'Indústria, Inovação e Infraestrutura'),
(10, 'Redução das Desigualdades'),
(11, 'Cidades e Comunidades Sustentáveis'),
(12, 'Consumo e Produção Responsáveis'),
(13, 'Ação Contra a Mudança Global do Clima'),
(14, 'Vida na Água'),
(15, 'Vida Terrestre'),
(16, 'Paz, Justiça e Instituições Eficazes'),
(17, 'Parcerias e Meios de Implementação');

-- --------------------------------------------------------

--
-- Estrutura da tabela `ods_projetos`
--

CREATE TABLE `ods_projetos` (
  `fk_projetos_id_projeto` int(11) DEFAULT NULL,
  `fk_ods_numero_ods` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estrutura da tabela `periodo_votacao`
--

CREATE TABLE `periodo_votacao` (
  `id_periodo` int(11) NOT NULL,
  `data_inicio` datetime NOT NULL,
  `data_encerramento` datetime NOT NULL,
  `andamento` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estrutura da tabela `ponto`
--

CREATE TABLE `ponto` (
  `id_ponto` int(11) NOT NULL,
  `x` varchar(255) DEFAULT NULL,
  `y` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estrutura da tabela `ponto_vizinho`
--

CREATE TABLE `ponto_vizinho` (
  `id_pontovizinho` int(11) NOT NULL,
  `fk_ponto_id_ponto` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estrutura da tabela `projetos`
--

CREATE TABLE `projetos` (
  `id_projeto` int(11) NOT NULL,
  `nome_projeto` varchar(255) DEFAULT NULL,
  `descricao` varchar(500) DEFAULT NULL,
  `turno` varchar(15) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Extraindo dados da tabela `projetos`
--

INSERT INTO `projetos` (`id_projeto`, `nome_projeto`, `descricao`, `turno`) VALUES
(1, 'CoroaAfro', 'Agência digital de marketing e empreendedorismo para microempreendedores afrodescendentes ', 'Manhã'),
(2, 'Valid', 'Plataforma de autenticação de documentos com IA', 'Manhã'),
(3, 'ShowMe', 'Plataforma de democratização do acesso à cultura', 'Manhã');

-- --------------------------------------------------------

--
-- Estrutura da tabela `resultado`
--

CREATE TABLE `resultado` (
  `id_resultado` int(11) NOT NULL,
  `posicao` int(11) NOT NULL,
  `quantidade_curtidas` int(11) NOT NULL,
  `data_encerramento` datetime NOT NULL,
  `id_projeto` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estrutura da tabela `serie`
--

CREATE TABLE `serie` (
  `id_serie` int(11) NOT NULL,
  `nome_serie` varchar(5) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Extraindo dados da tabela `serie`
--

INSERT INTO `serie` (`id_serie`, `nome_serie`) VALUES
(1, '3°C'),
(2, '3°A');

-- --------------------------------------------------------

--
-- Estrutura da tabela `serie_projetos`
--

CREATE TABLE `serie_projetos` (
  `fk_projetos_id_projeto` int(11) DEFAULT NULL,
  `fk_serie_id_serie` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Extraindo dados da tabela `serie_projetos`
--

INSERT INTO `serie_projetos` (`fk_projetos_id_projeto`, `fk_serie_id_serie`) VALUES
(1, 1),
(1, 2);

-- --------------------------------------------------------

--
-- Estrutura da tabela `stand`
--

CREATE TABLE `stand` (
  `numero_stand` int(11) NOT NULL,
  `fk_projetos_id_projeto` int(11) DEFAULT NULL,
  `fk_localizacao_id_localizacao` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Extraindo dados da tabela `stand`
--

INSERT INTO `stand` (`numero_stand`, `fk_projetos_id_projeto`, `fk_localizacao_id_localizacao`) VALUES
(1, 1, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `visitante`
--

CREATE TABLE `visitante` (
  `id_visitante` int(11) NOT NULL,
  `ip` varchar(45) NOT NULL,
  `modelo_dispositivo` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `alunos`
--
ALTER TABLE `alunos`
  ADD PRIMARY KEY (`id_aluno`),
  ADD KEY `FK_alunos_serie` (`fk_serie_id_serie`);

--
-- Índices para tabela `alunos_projetos`
--
ALTER TABLE `alunos_projetos`
  ADD PRIMARY KEY (`fk_aluno_id_aluno`,`fk_projetos_id_projeto`),
  ADD KEY `FK_alunos_projetos_2` (`fk_projetos_id_projeto`);

--
-- Índices para tabela `curso`
--
ALTER TABLE `curso`
  ADD PRIMARY KEY (`id_curso`);

--
-- Índices para tabela `curso_projetos`
--
ALTER TABLE `curso_projetos`
  ADD KEY `FK_curso_projetos_1` (`fk_curso_id_curso`),
  ADD KEY `FK_curso_projetos_2` (`fk_projetos_id_projeto`);

--
-- Índices para tabela `curtidas`
--
ALTER TABLE `curtidas`
  ADD PRIMARY KEY (`id_curtida`),
  ADD KEY `id_visitante` (`id_visitante`),
  ADD KEY `id_projeto` (`id_projeto`),
  ADD KEY `id_periodo` (`id_periodo`);

--
-- Índices para tabela `localizacao`
--
ALTER TABLE `localizacao`
  ADD PRIMARY KEY (`id_localizacao`);

--
-- Índices para tabela `localizacao_projetos`
--
ALTER TABLE `localizacao_projetos`
  ADD KEY `FK_localizacao_projetos_1` (`fk_projetos_id_projeto`),
  ADD KEY `FK_localizacao_projetos_2` (`fk_localizacao_id_localizacao`);

--
-- Índices para tabela `ods`
--
ALTER TABLE `ods`
  ADD PRIMARY KEY (`numero_ods`);

--
-- Índices para tabela `ods_projetos`
--
ALTER TABLE `ods_projetos`
  ADD KEY `FK_ods_projetos_1` (`fk_projetos_id_projeto`),
  ADD KEY `FK_ods_projetos_2` (`fk_ods_numero_ods`);

--
-- Índices para tabela `periodo_votacao`
--
ALTER TABLE `periodo_votacao`
  ADD PRIMARY KEY (`id_periodo`);

--
-- Índices para tabela `ponto`
--
ALTER TABLE `ponto`
  ADD PRIMARY KEY (`id_ponto`);

--
-- Índices para tabela `ponto_vizinho`
--
ALTER TABLE `ponto_vizinho`
  ADD PRIMARY KEY (`id_pontovizinho`),
  ADD KEY `FK_ponto_vizinho_2` (`fk_ponto_id_ponto`);

--
-- Índices para tabela `projetos`
--
ALTER TABLE `projetos`
  ADD PRIMARY KEY (`id_projeto`);

--
-- Índices para tabela `resultado`
--
ALTER TABLE `resultado`
  ADD PRIMARY KEY (`id_resultado`),
  ADD KEY `id_projeto` (`id_projeto`);

--
-- Índices para tabela `serie`
--
ALTER TABLE `serie`
  ADD PRIMARY KEY (`id_serie`);

--
-- Índices para tabela `serie_projetos`
--
ALTER TABLE `serie_projetos`
  ADD KEY `FK_serie_projetos_1` (`fk_projetos_id_projeto`),
  ADD KEY `FK_serie_projetos_2` (`fk_serie_id_serie`);

--
-- Índices para tabela `stand`
--
ALTER TABLE `stand`
  ADD PRIMARY KEY (`numero_stand`),
  ADD KEY `FK_stand_2` (`fk_projetos_id_projeto`),
  ADD KEY `FK_stand_3` (`fk_localizacao_id_localizacao`);

--
-- Índices para tabela `visitante`
--
ALTER TABLE `visitante`
  ADD PRIMARY KEY (`id_visitante`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `alunos`
--
ALTER TABLE `alunos`
  MODIFY `id_aluno` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `curso`
--
ALTER TABLE `curso`
  MODIFY `id_curso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `curtidas`
--
ALTER TABLE `curtidas`
  MODIFY `id_curtida` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `localizacao`
--
ALTER TABLE `localizacao`
  MODIFY `id_localizacao` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `periodo_votacao`
--
ALTER TABLE `periodo_votacao`
  MODIFY `id_periodo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `projetos`
--
ALTER TABLE `projetos`
  MODIFY `id_projeto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `resultado`
--
ALTER TABLE `resultado`
  MODIFY `id_resultado` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `serie`
--
ALTER TABLE `serie`
  MODIFY `id_serie` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `stand`
--
ALTER TABLE `stand`
  MODIFY `numero_stand` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `visitante`
--
ALTER TABLE `visitante`
  MODIFY `id_visitante` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restrições para despejos de tabelas
--

--
-- Limitadores para a tabela `alunos`
--
ALTER TABLE `alunos`
  ADD CONSTRAINT `FK_alunos_serie` FOREIGN KEY (`fk_serie_id_serie`) REFERENCES `serie` (`id_serie`);

--
-- Limitadores para a tabela `alunos_projetos`
--
ALTER TABLE `alunos_projetos`
  ADD CONSTRAINT `FK_alunos_projetos_1` FOREIGN KEY (`fk_aluno_id_aluno`) REFERENCES `alunos` (`id_aluno`),
  ADD CONSTRAINT `FK_alunos_projetos_2` FOREIGN KEY (`fk_projetos_id_projeto`) REFERENCES `projetos` (`id_projeto`);

--
-- Limitadores para a tabela `curso_projetos`
--
ALTER TABLE `curso_projetos`
  ADD CONSTRAINT `FK_curso_projetos_1` FOREIGN KEY (`fk_curso_id_curso`) REFERENCES `curso` (`id_curso`),
  ADD CONSTRAINT `FK_curso_projetos_2` FOREIGN KEY (`fk_projetos_id_projeto`) REFERENCES `projetos` (`id_projeto`);

--
-- Limitadores para a tabela `curtidas`
--
ALTER TABLE `curtidas`
  ADD CONSTRAINT `curtidas_ibfk_1` FOREIGN KEY (`id_visitante`) REFERENCES `visitante` (`id_visitante`),
  ADD CONSTRAINT `curtidas_ibfk_2` FOREIGN KEY (`id_projeto`) REFERENCES `projetos` (`id_projeto`),
  ADD CONSTRAINT `curtidas_ibfk_3` FOREIGN KEY (`id_periodo`) REFERENCES `periodo_votacao` (`id_periodo`);

--
-- Limitadores para a tabela `localizacao_projetos`
--
ALTER TABLE `localizacao_projetos`
  ADD CONSTRAINT `FK_localizacao_projetos_1` FOREIGN KEY (`fk_projetos_id_projeto`) REFERENCES `projetos` (`id_projeto`),
  ADD CONSTRAINT `FK_localizacao_projetos_2` FOREIGN KEY (`fk_localizacao_id_localizacao`) REFERENCES `localizacao` (`id_localizacao`);

--
-- Limitadores para a tabela `ods_projetos`
--
ALTER TABLE `ods_projetos`
  ADD CONSTRAINT `FK_ods_projetos_1` FOREIGN KEY (`fk_projetos_id_projeto`) REFERENCES `projetos` (`id_projeto`),
  ADD CONSTRAINT `FK_ods_projetos_2` FOREIGN KEY (`fk_ods_numero_ods`) REFERENCES `ods` (`numero_ods`);

--
-- Limitadores para a tabela `ponto_vizinho`
--
ALTER TABLE `ponto_vizinho`
  ADD CONSTRAINT `FK_ponto_vizinho_2` FOREIGN KEY (`fk_ponto_id_ponto`) REFERENCES `ponto` (`id_ponto`);

--
-- Limitadores para a tabela `resultado`
--
ALTER TABLE `resultado`
  ADD CONSTRAINT `resultado_ibfk_1` FOREIGN KEY (`id_projeto`) REFERENCES `projetos` (`id_projeto`);

--
-- Limitadores para a tabela `serie_projetos`
--
ALTER TABLE `serie_projetos`
  ADD CONSTRAINT `FK_serie_projetos_1` FOREIGN KEY (`fk_projetos_id_projeto`) REFERENCES `projetos` (`id_projeto`),
  ADD CONSTRAINT `FK_serie_projetos_2` FOREIGN KEY (`fk_serie_id_serie`) REFERENCES `serie` (`id_serie`);

--
-- Limitadores para a tabela `stand`
--
ALTER TABLE `stand`
  ADD CONSTRAINT `FK_stand_2` FOREIGN KEY (`fk_projetos_id_projeto`) REFERENCES `projetos` (`id_projeto`),
  ADD CONSTRAINT `FK_stand_3` FOREIGN KEY (`fk_localizacao_id_localizacao`) REFERENCES `localizacao` (`id_localizacao`);

-- Execute somente quando o banco oficial for atualizado.
-- Esses identificadores ligam uma localização ao destino técnico de um mapa.
ALTER TABLE `localizacao`
  ADD COLUMN `mapa_id` varchar(80) DEFAULT NULL AFTER `andar`,
  ADD COLUMN `elemento_mapa_id` varchar(80) DEFAULT NULL AFTER `mapa_id`;

CREATE UNIQUE INDEX `uq_localizacao_destino_mapa`
  ON `localizacao` (`mapa_id`, `elemento_mapa_id`);

-- A localização já cadastrada no banco atual corresponde à Sala 2 do Bloco A.
UPDATE `localizacao`
SET `mapa_id` = 'bloco-a-salas', `elemento_mapa_id` = 'sala-02'
WHERE `id_localizacao` = 1;

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


INSERT INTO mapas (id_mapa, nome, largura, altura, ativo) VALUES
('patio-biblioteca-auditorio', 'Pátio · Acesso alternativo', 19062, 24297, 1),
('bloco-a-salas', 'Bloco A · Salas', 12861, 42113, 1),
('bloco-b-andar-2', 'Passagem Bloco A · Bloco B · 2º andar', 20498, 19301, 1),
('bloco-b-andar-1', 'Bloco B · 1º andar', 7363, 13163, 1)
ON DUPLICATE KEY UPDATE nome=VALUES(nome), largura=VALUES(largura), altura=VALUES(altura), ativo=VALUES(ativo);

INSERT INTO mapa_pontos (mapa_id, id_ponto, nome, tipo, x, y, elemento_mapa_id) VALUES
('patio-biblioteca-auditorio', 'patio-entrada', 'Entrada da escola', 'entrance', 1500, 20645, 'entrada-principal'),
('patio-biblioteca-auditorio', 'patio-sul', 'Pátio sul', 'corridor', 3000, 20645, 'area-patio'),
('patio-biblioteca-auditorio', 'patio-conexao-a', 'Conexão com o Bloco A', 'corridor', 3000, 16423, NULL),
('patio-biblioteca-auditorio', 'patio-meio', 'Pátio central', 'corridor', 3000, 12798, NULL),
('patio-biblioteca-auditorio', 'patio-norte', 'Pátio norte', 'corridor', 3000, 8866, NULL),
('patio-biblioteca-auditorio', 'patio-escada-a', 'Escada para as salas do Bloco A', 'stairs', 700, 16423, 'escadas-bloco-a-salas'),
('patio-biblioteca-auditorio', 'patio-corredor-setor', 'Corredor de ligação', 'corridor', 3000, 7410.06, NULL),
('patio-biblioteca-auditorio', 'patio-cantina', 'Cantina', 'destination', 1500, 8866, 'cantina'),
('patio-biblioteca-auditorio', 'patio-refeitorio', 'Refeitório', 'destination', 1500, 12798, 'refeitorio'),
('patio-biblioteca-auditorio', 'patio-biblioteca-destino', 'Biblioteca', 'destination', 10449.2, 5085.42, 'biblioteca'),
('patio-biblioteca-auditorio', 'patio-destino', 'Pátio', 'destination', 5066.73, 13976.38, 'area-patio'),
('patio-biblioteca-auditorio', 'patio-corredor-biblioteca-01', 'Caminho para a biblioteca', 'corridor', 6322.03, 7341.18, NULL),
('patio-biblioteca-auditorio', 'patio-corredor-biblioteca-02', 'Corredor da biblioteca', 'corridor', 10616.27, 7490.62, NULL),
('patio-biblioteca-auditorio', 'patio-biblioteca-porta', 'Porta da biblioteca', 'door', 10650.33, 6796.68, 'porta-biblioteca'),
('bloco-a-salas', 'point-ec1c8366-91ac-4db4-a5a7-35ac3b311f97', 'porta sala 2 Bloco A', 'door', 5070.59, 13004.39, 'porta-01'),
('bloco-a-salas', 'point-5729c145-142b-4bfc-b6de-8a98dbae9288', 'Porta sala 1 Bloco A', 'door', 5041.53, 8770.72, NULL),
('bloco-a-salas', 'point-8a3ef943-d9f6-4750-888c-277b6c9fff73', 'Porta 3 Bloco A', 'door', 5105.98, 28390.93, 'porta-02'),
('bloco-a-salas', 'point-7b72dba8-cec0-4d76-ac10-8e339aa4b696', 'Porta 4 Bloco A', 'door', 6746.78, 31518.79, 'porta-03'),
('bloco-a-salas', 'point-07cdedc2-68a3-44f1-9e1e-9b762a262ee6', 'Porta 5 Bloco A', 'door', 5131.22, 32972.14, 'porta-04'),
('bloco-a-salas', 'point-53fe1e6d-701c-4382-aeea-5ea8376591fe', 'Porta 6 Bloco A', 'door', 6772.02, 36036.81, 'porta-05'),
('bloco-a-salas', 'point-017dc9e3-365a-4c44-9020-b10de2809fd9', 'Porta 7 Bloco A', 'door', 5121.33, 37679.73, 'porta-06'),
('bloco-a-salas', 'point-5b817953-4c14-45f6-8029-a1ee0e5915d4', 'Porta 8 Bloco A', 'door', 6839.32, 37679.73, 'porta-07'),
('bloco-a-salas', 'point-8d84b532-9539-42ce-96c2-4c1cc684f945', 'Entrada pelo Patio - Bloco A', 'entrance', 3541.74, 22092.24, 'patio-das-salas'),
('bloco-a-salas', 'point-c402a366-bc33-426c-88c1-73fdd5f3e031', 'Meio corredor salas bloco A', 'corridor', 5965.66, 22092.24, NULL),
('bloco-a-salas', 'point-67056680-a81b-492f-a9f8-ea5cb61c9525', 'Sala 1 Bloco A', 'destination', 2518.52, 10368.62, 'sala-01'),
('bloco-a-salas', 'point-26977485-f656-4022-8e6f-9862a37150f4', 'Sala 2 Bloco A', 'destination', 2650.23, 14616.18, 'sala-02'),
('bloco-a-salas', 'point-e52572ae-4bac-4973-b170-cc7e9a5aebd0', 'Sala 3 Bloco A', 'destination', 2485.59, 29960.06, 'sala-03'),
('bloco-a-salas', 'point-cbd0e946-8560-488e-a63c-37047b62cf75', 'Sala 8 Bloco A', 'destination', 9663.63, 29960.06, 'sala-08'),
('bloco-a-salas', 'point-29219c08-d623-4539-b93f-dc5b5cb1147d', 'Sala 4 Bloco A', 'destination', 2518.52, 34602.74, 'sala-04'),
('bloco-a-salas', 'point-59797ffc-2dd5-4eb5-a188-8fa0a1792083', 'Sala 7 Bloco A', 'destination', 9466.07, 34701.52, 'sala-07'),
('bloco-a-salas', 'point-9a5b2e37-7289-4b47-9c1e-5c55c177e822', 'Sala 5 Bloco A', 'destination', 2386.81, 39311.27, 'sala-05'),
('bloco-a-salas', 'point-0e8ad8b5-cf50-4cf7-a50d-e41f9781540b', 'Sala 6 Bloco A', 'destination', 9531.93, 39245.42, 'sala-06'),
('bloco-a-salas', 'point-0f4643f7-d5e1-4440-af95-2f21d08c4796', 'caminho Sala 3 bloco A', 'corridor', 5965.66, 28390.93, NULL),
('bloco-a-salas', 'point-d9b120b0-b92a-47b3-b48e-5f0cf089915a', 'caminho sala 4 bloco A', 'corridor', 5965.66, 31518.79, NULL),
('bloco-a-salas', 'point-3fafcd7b-6df8-48c7-9c6a-10ae5417eb97', 'caminho sala 5 bloco A', 'corridor', 5965.66, 32972.14, NULL),
('bloco-a-salas', 'point-9bbb78f2-72dc-40c3-b921-98ea9a13c07e', 'caminho sala 6 bloco A', 'corridor', 5965.66, 36036.81, NULL),
('bloco-a-salas', 'point-b2f7ac9b-ef09-4844-a846-cbba62b8a728', 'caminho sala 7 8 bloco A', 'corridor', 5965.66, 37679.73, NULL),
('bloco-a-salas', 'point-7985ef2b-1544-4966-af38-3b0739debef3', 'Caminho  sala 2 bloco A', 'corridor', 5965.66, 13004.39, NULL),
('bloco-a-salas', 'point-403d8e1f-0e44-49cc-8813-81abf0f844e4', 'Caminho sala 1 bloco A', 'corridor', 5965.66, 8770.72, NULL),
('bloco-b-andar-2', 'passagem-escada-patio', 'Escada para o pátio e salas do Bloco A', 'stairs', 19545, 9629, 'escada-acesso-patio-bloco-a'),
('bloco-b-andar-2', 'passagem-corredor-escada', 'Corredor da escada', 'corridor', 17300, 9629, 'corredor-passagem-bloco-a'),
('bloco-b-andar-2', 'passagem-corredor-lab-01', 'Corredor do Laboratório 1 do Bloco A', 'corridor', 17277.26, 7084.82, NULL),
('bloco-b-andar-2', 'passagem-lab-01-porta', 'Porta do Laboratório 1 do Bloco A', 'door', 16516.09, 7070.75, NULL),
('bloco-b-andar-2', 'passagem-lab-01-destino', 'Laboratório 1 · Bloco A · Passagem', 'destination', 15364.33, 7100.77, 'sala-lab-bloco-a-01'),
('bloco-b-andar-2', 'passagem-corredor-lab-02', 'Corredor do Laboratório 2 do Bloco A', 'corridor', 17277.26, 9225.61, NULL),
('bloco-b-andar-2', 'passagem-lab-02-porta', 'Porta do Laboratório 2 do Bloco A', 'door', 16577.26, 9225.61, NULL),
('bloco-b-andar-2', 'passagem-lab-02-destino', 'Laboratório 2 · Bloco A · Passagem', 'destination', 15286.89, 9281.16, 'sala-lab-bloco-a-02'),
('bloco-b-andar-2', 'passagem-corredor-lab-03', 'Corredor do Laboratório 3 do Bloco A', 'corridor', 17282.16, 11431.09, NULL),
('bloco-b-andar-2', 'passagem-lab-03-porta', 'Porta do Laboratório 3 do Bloco A', 'door', 16546.49, 11413.26, NULL),
('bloco-b-andar-2', 'passagem-lab-03-destino', 'Laboratório 3 · Bloco A · Passagem', 'destination', 15478.66, 11377.59, 'sala-lab-bloco-a-03'),
('bloco-b-andar-2', 'passagem-corredor-lab-04', 'Corredor do Laboratório 4 do Bloco A', 'corridor', 17300, 13460.37, NULL),
('bloco-b-andar-2', 'passagem-lab-04-porta', 'Porta do Laboratório 4 do Bloco A', 'door', 16582.16, 13478.21, NULL),
('bloco-b-andar-2', 'passagem-lab-04-destino', 'Laboratório 4 · Bloco A · Passagem', 'destination', 15550, 13424.7, 'sala-lab-bloco-a-04'),
('bloco-b-andar-2', 'passagem-corredor-central', 'Corredor de ligação dos blocos', 'corridor', 17300, 16368, NULL),
('bloco-b-andar-2', 'passagem-chegada-bloco-b', 'Chegada ao 2º andar do Bloco B', 'corridor', 6918.45, 16361.57, NULL),
('bloco-b-andar-2', 'b2-escada-destino', 'Escada para o 1º andar do Bloco B', 'stairs', 6263, 9874, 'escadas-acesso-patio'),
('bloco-b-andar-2', 'b2-escada-corredor', 'Corredor da escada', 'corridor', 4863, 9874, 'corredor-principal'),
('bloco-b-andar-2', 'b2-corredor-topo', 'Corredor superior', 'corridor', 4711.36, 16351.34, NULL),
('bloco-b-andar-2', 'b2-corredor-direito-topo', 'Corredor dos laboratórios', 'corridor', 3664.96, 16254.56, NULL),
('bloco-b-andar-2', 'b2-corredor-tcc', 'Corredor do Laboratório TCC', 'corridor', 3629.29, 12966.21, NULL),
('bloco-b-andar-2', 'b2-corredor-lab-04', 'Corredor do Laboratório 4', 'corridor', 3557.95, 10762.05, NULL),
('bloco-b-andar-2', 'b2-corredor-banheiro-masculino', 'Corredor do banheiro masculino', 'corridor', 4863, 7511, NULL),
('bloco-b-andar-2', 'b2-corredor-banheiro-feminino', 'Corredor do banheiro feminino', 'corridor', 4863, 6151, NULL),
('bloco-b-andar-2', 'b2-corredor-maker', 'Corredor do Laboratório Maker', 'corridor', 3575.79, 7294.51, NULL),
('bloco-b-andar-2', 'b2-quimica-01-porta', 'Porta do Laboratório de Química 1', 'door', 4653.6, 17185.38, NULL),
('bloco-b-andar-2', 'b2-quimica-01-destino', 'Laboratório de Química 1 · Bloco B · 2º andar', 'destination', 3650.9, 18401, 'sala-lab-quimica-01'),
('bloco-b-andar-2', 'b2-quimica-02-porta', 'Porta do Laboratório de Química 2', 'door', 1746.33, 16236.72, NULL),
('bloco-b-andar-2', 'b2-quimica-02-destino', 'Laboratório de Química 2 · Bloco B · 2º andar', 'destination', 873.82, 15862.19, 'sala-lab-quimica-02'),
('bloco-b-andar-2', 'b2-tcc-porta', 'Porta do Laboratório TCC', 'door', 1780, 13001.88, NULL),
('bloco-b-andar-2', 'b2-tcc-destino', 'Laboratório TCC · Bloco B · 2º andar', 'destination', 963, 13079.97, 'sala-lab-tcc'),
('bloco-b-andar-2', 'b2-lab-04-porta', 'Porta do Laboratório 4', 'door', 1744.33, 10690.71, NULL),
('bloco-b-andar-2', 'b2-lab-04-destino', 'Laboratório 4 · Bloco B · 2º andar', 'destination', 963, 10726.46, 'sala-lab-04'),
('bloco-b-andar-2', 'b2-maker-porta', 'Porta do Laboratório Maker', 'door', 1793, 7276.67, NULL),
('bloco-b-andar-2', 'b2-maker-destino', 'Laboratório Maker · Bloco B · 2º andar', 'destination', 963, 7301, 'sala-lab-maker'),
('bloco-b-andar-2', 'b2-banheiro-masculino-destino', 'Banheiro masculino · Bloco B · 2º andar', 'destination', 6463, 7511, 'banheiro-masculino'),
('bloco-b-andar-2', 'b2-banheiro-feminino-destino', 'Banheiro feminino · Bloco B · 2º andar', 'destination', 6463, 6151, 'banheiro-feminino'),
('bloco-b-andar-2', 'passagem-corredor-mbiol', 'Corredor do Laboratório MIBOL', 'corridor', 17300, 4080, NULL),
('bloco-b-andar-2', 'passagem-mbiol-porta', 'Porta do Laboratório MIBOL', 'door', 16550, 4080, NULL),
('bloco-b-andar-2', 'passagem-mbiol-destino', 'Laboratório MIBOL · Bloco A · Passagem', 'destination', 15375, 4080, 'sala-lab-mbiol'),
('bloco-b-andar-2', 'passagem-corredor-instrumental', 'Corredor do Laboratório Instrumental', 'corridor', 17300, 1580, NULL),
('bloco-b-andar-2', 'passagem-instrumental-porta', 'Porta do Laboratório Instrumental', 'door', 16550, 1580, NULL),
('bloco-b-andar-2', 'passagem-instrumental-destino', 'Laboratório Instrumental · Bloco A · Passagem', 'destination', 15375, 1580, 'sala-lab-instrumental'),
('bloco-b-andar-1', 'b1-escada-destino', 'Escada para o 2º andar', 'stairs', 1078, 9242, 'escadas-acesso-andar-2'),
('bloco-b-andar-1', 'b1-escada-corredor', 'Corredor da escada', 'corridor', 2528, 9242, 'corredor-principal'),
('bloco-b-andar-1', 'b1-corredor-sala-04', 'Corredor da Sala 4', 'corridor', 5028, 5442, 'corredor-principal'),
('bloco-b-andar-1', 'b1-corredor-sala-03', 'Corredor da Sala 3', 'corridor', 5028, 7927, 'corredor-principal'),
('bloco-b-andar-1', 'b1-corredor-sala-02', 'Corredor da Sala 2', 'corridor', 5028, 8752, 'corredor-principal'),
('bloco-b-andar-1', 'b1-corredor-sala-01', 'Corredor da Sala 1', 'corridor', 5028, 11207, 'corredor-principal'),
('bloco-b-andar-1', 'b1-sala-04-porta', 'Porta da Sala 4', 'door', 5771, 5442, NULL),
('bloco-b-andar-1', 'b1-sala-04-destino', 'Sala 4 · Bloco B · 1º andar', 'destination', 6528, 4692, 'sala-04'),
('bloco-b-andar-1', 'b1-sala-03-porta', 'Porta da Sala 3', 'door', 5771, 7927, NULL),
('bloco-b-andar-1', 'b1-sala-03-destino', 'Sala 3 · Bloco B · 1º andar', 'destination', 6528, 7092, 'sala-03'),
('bloco-b-andar-1', 'b1-sala-02-porta', 'Porta da Sala 2', 'door', 5771, 8752, NULL),
('bloco-b-andar-1', 'b1-sala-02-destino', 'Sala 2 · Bloco B · 1º andar', 'destination', 6528, 9542, 'sala-02'),
('bloco-b-andar-1', 'b1-sala-01-porta', 'Porta da Sala 1', 'door', 5771, 11207, NULL),
('bloco-b-andar-1', 'b1-sala-01-destino', 'Sala 1 · Bloco B · 1º andar', 'destination', 6528, 11892, 'sala-01'),
('bloco-b-andar-1', 'b1-banheiro-masculino-corredor', 'Corredor do banheiro masculino', 'corridor', 2528, 10842, NULL),
('bloco-b-andar-1', 'b1-banheiro-masculino-destino', 'Banheiro masculino · Bloco B · 1º andar', 'destination', 878, 10842, 'banheiro-masculino'),
('bloco-b-andar-1', 'b1-banheiro-feminino-corredor', 'Corredor do banheiro feminino', 'corridor', 2528, 12012, NULL),
('bloco-b-andar-1', 'b1-banheiro-feminino-destino', 'Banheiro feminino · Bloco B · 1º andar', 'destination', 878, 12012, 'banheiro-feminino'),
('bloco-b-andar-1', 'b1-saida-corredor', 'Corredor da saída da quadra', 'corridor', 4078, 12392, NULL),
('bloco-b-andar-1', 'b1-saida-destino', 'Saída da quadra · Bloco B · 1º andar', 'destination', 4078, 12742, 'saida-quadra'),
('bloco-b-andar-1', 'b1-corredor-sala-05', 'Corredor da Sala 5', 'corridor', 5028, 2859, 'corredor-principal'),
('bloco-b-andar-1', 'b1-sala-05-porta', 'Porta da Sala 5', 'door', 5885, 2859, NULL),
('bloco-b-andar-1', 'b1-sala-05-destino', 'Sala 5 · Bloco B · 1º andar', 'destination', 6600, 2200, 'sala-05'),
('bloco-b-andar-1', 'b1-corredor-sala-06', 'Corredor da Sala 6', 'corridor', 5249, 2859, 'corredor-principal'),
('bloco-b-andar-1', 'b1-sala-06-porta', 'Porta da Sala 6', 'door', 5249, 2549, NULL),
('bloco-b-andar-1', 'b1-sala-06-destino', 'Sala 6 · Bloco B · 1º andar', 'destination', 3700, 1800, 'sala-06');

INSERT INTO mapa_conexoes (mapa_id, id_conexao, ponto_origem_id, ponto_destino_id) VALUES
('patio-biblioteca-auditorio', 'patio-e01', 'patio-entrada', 'patio-sul'),
('patio-biblioteca-auditorio', 'patio-e02', 'patio-sul', 'patio-conexao-a'),
('patio-biblioteca-auditorio', 'patio-e03', 'patio-conexao-a', 'patio-escada-a'),
('patio-biblioteca-auditorio', 'patio-e04', 'patio-conexao-a', 'patio-meio'),
('patio-biblioteca-auditorio', 'patio-e05', 'patio-meio', 'patio-norte'),
('patio-biblioteca-auditorio', 'patio-e06', 'patio-norte', 'patio-corredor-setor'),
('patio-biblioteca-auditorio', 'patio-e08', 'patio-norte', 'patio-cantina'),
('patio-biblioteca-auditorio', 'patio-e09', 'patio-meio', 'patio-refeitorio'),
('patio-biblioteca-auditorio', 'patio-e10', 'patio-conexao-a', 'patio-destino'),
('patio-biblioteca-auditorio', 'patio-e11', 'patio-corredor-setor', 'patio-corredor-biblioteca-01'),
('patio-biblioteca-auditorio', 'patio-e12', 'patio-corredor-biblioteca-01', 'patio-corredor-biblioteca-02'),
('patio-biblioteca-auditorio', 'patio-e13', 'patio-corredor-biblioteca-02', 'patio-biblioteca-porta'),
('patio-biblioteca-auditorio', 'patio-e14', 'patio-biblioteca-porta', 'patio-biblioteca-destino'),
('bloco-a-salas', 'edge-9af36591-4ce9-43e8-9bdd-d7833be065dc', 'point-8d84b532-9539-42ce-96c2-4c1cc684f945', 'point-c402a366-bc33-426c-88c1-73fdd5f3e031'),
('bloco-a-salas', 'edge-bfd6e1bb-56d8-4209-b8e9-571067ff379d', 'point-ec1c8366-91ac-4db4-a5a7-35ac3b311f97', 'point-26977485-f656-4022-8e6f-9862a37150f4'),
('bloco-a-salas', 'edge-c531f519-95b5-47a3-ba9f-67c726f0661f', 'point-5729c145-142b-4bfc-b6de-8a98dbae9288', 'point-67056680-a81b-492f-a9f8-ea5cb61c9525'),
('bloco-a-salas', 'edge-5bd51191-1bf5-4f66-95ea-070cefbb3a59', 'point-5b817953-4c14-45f6-8029-a1ee0e5915d4', 'point-0e8ad8b5-cf50-4cf7-a50d-e41f9781540b'),
('bloco-a-salas', 'edge-5868c149-de1d-43e6-afea-6d5301402789', 'point-017dc9e3-365a-4c44-9020-b10de2809fd9', 'point-9a5b2e37-7289-4b47-9c1e-5c55c177e822'),
('bloco-a-salas', 'edge-56135528-1f57-4c4c-84bb-d88041aa1d4f', 'point-8a3ef943-d9f6-4750-888c-277b6c9fff73', 'point-e52572ae-4bac-4973-b170-cc7e9a5aebd0'),
('bloco-a-salas', 'edge-b1a91d55-79a6-453e-bd28-6d9267e6292f', 'point-7b72dba8-cec0-4d76-ac10-8e339aa4b696', 'point-cbd0e946-8560-488e-a63c-37047b62cf75'),
('bloco-a-salas', 'edge-fdcc9826-5e55-4871-90f4-e58f45cfd29e', 'point-07cdedc2-68a3-44f1-9e1e-9b762a262ee6', 'point-29219c08-d623-4539-b93f-dc5b5cb1147d'),
('bloco-a-salas', 'edge-9fe9ac73-d76f-43dc-a274-70314536225d', 'point-53fe1e6d-701c-4382-aeea-5ea8376591fe', 'point-59797ffc-2dd5-4eb5-a188-8fa0a1792083'),
('bloco-a-salas', 'edge-26e901c1-d8fb-4a9e-bdba-884e7ffa0a43', 'point-c402a366-bc33-426c-88c1-73fdd5f3e031', 'point-7985ef2b-1544-4966-af38-3b0739debef3'),
('bloco-a-salas', 'edge-4c04ef9b-8207-448e-ab01-d0347e98db61', 'point-7985ef2b-1544-4966-af38-3b0739debef3', 'point-ec1c8366-91ac-4db4-a5a7-35ac3b311f97'),
('bloco-a-salas', 'edge-87cc8998-6833-4fd7-a7ae-89ae91ec9169', 'point-7985ef2b-1544-4966-af38-3b0739debef3', 'point-403d8e1f-0e44-49cc-8813-81abf0f844e4'),
('bloco-a-salas', 'edge-ddf86ad9-b42e-45c6-b1a6-8415be2893f8', 'point-403d8e1f-0e44-49cc-8813-81abf0f844e4', 'point-5729c145-142b-4bfc-b6de-8a98dbae9288'),
('bloco-a-salas', 'edge-d62b2a80-6809-4d06-9572-889ab55b17df', 'point-c402a366-bc33-426c-88c1-73fdd5f3e031', 'point-0f4643f7-d5e1-4440-af95-2f21d08c4796'),
('bloco-a-salas', 'edge-a55d958d-4b44-4496-bbb9-b8627c748a01', 'point-0f4643f7-d5e1-4440-af95-2f21d08c4796', 'point-8a3ef943-d9f6-4750-888c-277b6c9fff73'),
('bloco-a-salas', 'edge-9a1edb13-9f6d-4a3f-9202-cef554e6ac52', 'point-0f4643f7-d5e1-4440-af95-2f21d08c4796', 'point-d9b120b0-b92a-47b3-b48e-5f0cf089915a'),
('bloco-a-salas', 'edge-8262e7c5-6350-48d9-9c77-916fe60917c8', 'point-d9b120b0-b92a-47b3-b48e-5f0cf089915a', 'point-7b72dba8-cec0-4d76-ac10-8e339aa4b696'),
('bloco-a-salas', 'edge-b7f28234-2f2e-4514-9ef3-b7bdaaa712db', 'point-d9b120b0-b92a-47b3-b48e-5f0cf089915a', 'point-3fafcd7b-6df8-48c7-9c6a-10ae5417eb97'),
('bloco-a-salas', 'edge-96007bbc-15f6-4a9c-bbc5-1f40ca34c04f', 'point-3fafcd7b-6df8-48c7-9c6a-10ae5417eb97', 'point-07cdedc2-68a3-44f1-9e1e-9b762a262ee6'),
('bloco-a-salas', 'edge-943b9267-fa53-4a7c-8103-2209d571b430', 'point-3fafcd7b-6df8-48c7-9c6a-10ae5417eb97', 'point-9bbb78f2-72dc-40c3-b921-98ea9a13c07e'),
('bloco-a-salas', 'edge-02d926f1-0529-4e44-99d0-614a51da6818', 'point-9bbb78f2-72dc-40c3-b921-98ea9a13c07e', 'point-53fe1e6d-701c-4382-aeea-5ea8376591fe'),
('bloco-a-salas', 'edge-90c506cb-4ed8-4bed-9376-7f612643d8dd', 'point-9bbb78f2-72dc-40c3-b921-98ea9a13c07e', 'point-b2f7ac9b-ef09-4844-a846-cbba62b8a728'),
('bloco-a-salas', 'edge-281cc2ef-9d84-41bb-9b9a-70c4a6c2fa02', 'point-b2f7ac9b-ef09-4844-a846-cbba62b8a728', 'point-017dc9e3-365a-4c44-9020-b10de2809fd9'),
('bloco-a-salas', 'edge-531384f1-b13c-4e6b-97a3-c65456e065e7', 'point-b2f7ac9b-ef09-4844-a846-cbba62b8a728', 'point-5b817953-4c14-45f6-8029-a1ee0e5915d4'),
('bloco-b-andar-2', 'passagem-e01', 'passagem-escada-patio', 'passagem-corredor-escada'),
('bloco-b-andar-2', 'passagem-e02', 'passagem-corredor-escada', 'passagem-corredor-lab-02'),
('bloco-b-andar-2', 'passagem-e03', 'passagem-corredor-lab-02', 'passagem-corredor-lab-01'),
('bloco-b-andar-2', 'passagem-e04', 'passagem-corredor-escada', 'passagem-corredor-lab-03'),
('bloco-b-andar-2', 'passagem-e05', 'passagem-corredor-lab-03', 'passagem-corredor-lab-04'),
('bloco-b-andar-2', 'passagem-e06', 'passagem-corredor-lab-04', 'passagem-corredor-central'),
('bloco-b-andar-2', 'passagem-e07', 'passagem-corredor-central', 'passagem-chegada-bloco-b'),
('bloco-b-andar-2', 'passagem-e08', 'passagem-chegada-bloco-b', 'b2-corredor-topo'),
('bloco-b-andar-2', 'passagem-lab-01-porta', 'passagem-corredor-lab-01', 'passagem-lab-01-porta'),
('bloco-b-andar-2', 'passagem-lab-01-destino', 'passagem-lab-01-porta', 'passagem-lab-01-destino'),
('bloco-b-andar-2', 'passagem-lab-02-porta', 'passagem-corredor-lab-02', 'passagem-lab-02-porta'),
('bloco-b-andar-2', 'passagem-lab-02-destino', 'passagem-lab-02-porta', 'passagem-lab-02-destino'),
('bloco-b-andar-2', 'passagem-lab-03-porta', 'passagem-corredor-lab-03', 'passagem-lab-03-porta'),
('bloco-b-andar-2', 'passagem-lab-03-destino', 'passagem-lab-03-porta', 'passagem-lab-03-destino'),
('bloco-b-andar-2', 'passagem-lab-04-porta', 'passagem-corredor-lab-04', 'passagem-lab-04-porta'),
('bloco-b-andar-2', 'passagem-lab-04-destino', 'passagem-lab-04-porta', 'passagem-lab-04-destino'),
('bloco-b-andar-2', 'b2-e01', 'b2-escada-destino', 'b2-escada-corredor'),
('bloco-b-andar-2', 'b2-e02', 'b2-corredor-topo', 'b2-escada-corredor'),
('bloco-b-andar-2', 'b2-e03', 'b2-corredor-topo', 'b2-quimica-01-porta'),
('bloco-b-andar-2', 'b2-e04', 'b2-quimica-01-porta', 'b2-quimica-01-destino'),
('bloco-b-andar-2', 'b2-e05', 'b2-corredor-topo', 'b2-corredor-direito-topo'),
('bloco-b-andar-2', 'b2-e06', 'b2-corredor-direito-topo', 'b2-quimica-02-porta'),
('bloco-b-andar-2', 'b2-e07', 'b2-quimica-02-porta', 'b2-quimica-02-destino'),
('bloco-b-andar-2', 'b2-e08', 'b2-corredor-direito-topo', 'b2-corredor-tcc'),
('bloco-b-andar-2', 'b2-e09', 'b2-corredor-tcc', 'b2-tcc-porta'),
('bloco-b-andar-2', 'b2-e10', 'b2-tcc-porta', 'b2-tcc-destino'),
('bloco-b-andar-2', 'b2-e11', 'b2-corredor-tcc', 'b2-corredor-lab-04'),
('bloco-b-andar-2', 'b2-e12', 'b2-corredor-lab-04', 'b2-lab-04-porta'),
('bloco-b-andar-2', 'b2-e13', 'b2-lab-04-porta', 'b2-lab-04-destino'),
('bloco-b-andar-2', 'b2-e14', 'b2-escada-corredor', 'b2-corredor-banheiro-masculino'),
('bloco-b-andar-2', 'b2-e15', 'b2-corredor-banheiro-masculino', 'b2-banheiro-masculino-destino'),
('bloco-b-andar-2', 'b2-e16', 'b2-corredor-banheiro-masculino', 'b2-corredor-banheiro-feminino'),
('bloco-b-andar-2', 'b2-e17', 'b2-corredor-banheiro-feminino', 'b2-banheiro-feminino-destino'),
('bloco-b-andar-2', 'b2-e20', 'b2-corredor-lab-04', 'b2-corredor-maker'),
('bloco-b-andar-2', 'b2-e21', 'b2-corredor-maker', 'b2-maker-porta'),
('bloco-b-andar-2', 'b2-e22', 'b2-maker-porta', 'b2-maker-destino'),
('bloco-b-andar-2', 'passagem-e23', 'passagem-corredor-lab-01', 'passagem-corredor-mbiol'),
('bloco-b-andar-2', 'passagem-e24', 'passagem-corredor-mbiol', 'passagem-corredor-instrumental'),
('bloco-b-andar-2', 'passagem-mbiol-porta', 'passagem-corredor-mbiol', 'passagem-mbiol-porta'),
('bloco-b-andar-2', 'passagem-mbiol-destino', 'passagem-mbiol-porta', 'passagem-mbiol-destino'),
('bloco-b-andar-2', 'passagem-instrumental-porta', 'passagem-corredor-instrumental', 'passagem-instrumental-porta'),
('bloco-b-andar-2', 'passagem-instrumental-destino', 'passagem-instrumental-porta', 'passagem-instrumental-destino'),
('bloco-b-andar-1', 'b1-e01', 'b1-escada-destino', 'b1-escada-corredor'),
('bloco-b-andar-1', 'b1-e02', 'b1-escada-corredor', 'b1-corredor-sala-02'),
('bloco-b-andar-1', 'b1-e03', 'b1-corredor-sala-04', 'b1-corredor-sala-03'),
('bloco-b-andar-1', 'b1-e04', 'b1-corredor-sala-03', 'b1-corredor-sala-02'),
('bloco-b-andar-1', 'b1-e05', 'b1-corredor-sala-02', 'b1-corredor-sala-01'),
('bloco-b-andar-1', 'b1-e06', 'b1-corredor-sala-04', 'b1-sala-04-porta'),
('bloco-b-andar-1', 'b1-e07', 'b1-sala-04-porta', 'b1-sala-04-destino'),
('bloco-b-andar-1', 'b1-e08', 'b1-corredor-sala-03', 'b1-sala-03-porta'),
('bloco-b-andar-1', 'b1-e09', 'b1-sala-03-porta', 'b1-sala-03-destino'),
('bloco-b-andar-1', 'b1-e10', 'b1-corredor-sala-02', 'b1-sala-02-porta'),
('bloco-b-andar-1', 'b1-e11', 'b1-sala-02-porta', 'b1-sala-02-destino'),
('bloco-b-andar-1', 'b1-e12', 'b1-corredor-sala-01', 'b1-sala-01-porta'),
('bloco-b-andar-1', 'b1-e13', 'b1-sala-01-porta', 'b1-sala-01-destino'),
('bloco-b-andar-1', 'b1-e14', 'b1-escada-corredor', 'b1-banheiro-masculino-corredor'),
('bloco-b-andar-1', 'b1-e15', 'b1-banheiro-masculino-corredor', 'b1-banheiro-masculino-destino'),
('bloco-b-andar-1', 'b1-e16', 'b1-banheiro-masculino-corredor', 'b1-banheiro-feminino-corredor'),
('bloco-b-andar-1', 'b1-e17', 'b1-banheiro-feminino-corredor', 'b1-banheiro-feminino-destino'),
('bloco-b-andar-1', 'b1-e18', 'b1-banheiro-feminino-corredor', 'b1-saida-corredor'),
('bloco-b-andar-1', 'b1-e19', 'b1-saida-corredor', 'b1-saida-destino'),
('bloco-b-andar-1', 'b1-e20', 'b1-corredor-sala-04', 'b1-corredor-sala-05'),
('bloco-b-andar-1', 'b1-e21', 'b1-corredor-sala-05', 'b1-sala-05-porta'),
('bloco-b-andar-1', 'b1-e22', 'b1-sala-05-porta', 'b1-sala-05-destino'),
('bloco-b-andar-1', 'b1-e23', 'b1-corredor-sala-05', 'b1-corredor-sala-06'),
('bloco-b-andar-1', 'b1-e24', 'b1-corredor-sala-06', 'b1-sala-06-porta'),
('bloco-b-andar-1', 'b1-e25', 'b1-sala-06-porta', 'b1-sala-06-destino');

INSERT INTO mapa_portais (mapa_origem_id, ponto_origem_id, mapa_destino_id, ponto_destino_id, descricao) VALUES
('patio-biblioteca-auditorio', 'patio-escada-a', 'bloco-a-salas', 'point-8d84b532-9539-42ce-96c2-4c1cc684f945', 'Escada do pátio para as salas do Bloco A'),
('patio-biblioteca-auditorio', 'patio-escada-a', 'bloco-b-andar-2', 'passagem-escada-patio', 'Escada do pátio para a passagem dos laboratórios do Bloco A'),
('bloco-b-andar-2', 'b2-escada-destino', 'bloco-b-andar-1', 'b1-escada-destino', 'Escada entre o segundo e o primeiro andar do Bloco B');


COMMIT;
SET FOREIGN_KEY_CHECKS = 1;
