-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 02-Set-2026 às 15:28
-- Versão do servidor: 10.4.22-MariaDB
-- versão do PHP: 8.1.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `feira-tecnologica-2026-turma-a`
--
CREATE DATABASE IF NOT EXISTS `feira-tecnologica-2026-turma-a` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `feira-tecnologica-2026-turma-a`;

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
--
-- Banco de dados: `phpmyadmin`
--
CREATE DATABASE IF NOT EXISTS `phpmyadmin` DEFAULT CHARACTER SET utf8 COLLATE utf8_bin;
USE `phpmyadmin`;

-- --------------------------------------------------------

--
-- Estrutura da tabela `pma__bookmark`
--

CREATE TABLE `pma__bookmark` (
  `id` int(10) UNSIGNED NOT NULL,
  `dbase` varchar(255) COLLATE utf8_bin NOT NULL DEFAULT '',
  `user` varchar(255) COLLATE utf8_bin NOT NULL DEFAULT '',
  `label` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `query` text COLLATE utf8_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Bookmarks';

-- --------------------------------------------------------

--
-- Estrutura da tabela `pma__central_columns`
--

CREATE TABLE `pma__central_columns` (
  `db_name` varchar(64) COLLATE utf8_bin NOT NULL,
  `col_name` varchar(64) COLLATE utf8_bin NOT NULL,
  `col_type` varchar(64) COLLATE utf8_bin NOT NULL,
  `col_length` text COLLATE utf8_bin DEFAULT NULL,
  `col_collation` varchar(64) COLLATE utf8_bin NOT NULL,
  `col_isNull` tinyint(1) NOT NULL,
  `col_extra` varchar(255) COLLATE utf8_bin DEFAULT '',
  `col_default` text COLLATE utf8_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Central list of columns';

-- --------------------------------------------------------

--
-- Estrutura da tabela `pma__column_info`
--

CREATE TABLE `pma__column_info` (
  `id` int(5) UNSIGNED NOT NULL,
  `db_name` varchar(64) COLLATE utf8_bin NOT NULL DEFAULT '',
  `table_name` varchar(64) COLLATE utf8_bin NOT NULL DEFAULT '',
  `column_name` varchar(64) COLLATE utf8_bin NOT NULL DEFAULT '',
  `comment` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `mimetype` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `transformation` varchar(255) COLLATE utf8_bin NOT NULL DEFAULT '',
  `transformation_options` varchar(255) COLLATE utf8_bin NOT NULL DEFAULT '',
  `input_transformation` varchar(255) COLLATE utf8_bin NOT NULL DEFAULT '',
  `input_transformation_options` varchar(255) COLLATE utf8_bin NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Column information for phpMyAdmin';

-- --------------------------------------------------------

--
-- Estrutura da tabela `pma__designer_settings`
--

CREATE TABLE `pma__designer_settings` (
  `username` varchar(64) COLLATE utf8_bin NOT NULL,
  `settings_data` text COLLATE utf8_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Settings related to Designer';

-- --------------------------------------------------------

--
-- Estrutura da tabela `pma__export_templates`
--

CREATE TABLE `pma__export_templates` (
  `id` int(5) UNSIGNED NOT NULL,
  `username` varchar(64) COLLATE utf8_bin NOT NULL,
  `export_type` varchar(10) COLLATE utf8_bin NOT NULL,
  `template_name` varchar(64) COLLATE utf8_bin NOT NULL,
  `template_data` text COLLATE utf8_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Saved export templates';

-- --------------------------------------------------------

--
-- Estrutura da tabela `pma__favorite`
--

CREATE TABLE `pma__favorite` (
  `username` varchar(64) COLLATE utf8_bin NOT NULL,
  `tables` text COLLATE utf8_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Favorite tables';

-- --------------------------------------------------------

--
-- Estrutura da tabela `pma__history`
--

CREATE TABLE `pma__history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `username` varchar(64) COLLATE utf8_bin NOT NULL DEFAULT '',
  `db` varchar(64) COLLATE utf8_bin NOT NULL DEFAULT '',
  `table` varchar(64) COLLATE utf8_bin NOT NULL DEFAULT '',
  `timevalue` timestamp NOT NULL DEFAULT current_timestamp(),
  `sqlquery` text COLLATE utf8_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='SQL history for phpMyAdmin';

-- --------------------------------------------------------

--
-- Estrutura da tabela `pma__navigationhiding`
--

CREATE TABLE `pma__navigationhiding` (
  `username` varchar(64) COLLATE utf8_bin NOT NULL,
  `item_name` varchar(64) COLLATE utf8_bin NOT NULL,
  `item_type` varchar(64) COLLATE utf8_bin NOT NULL,
  `db_name` varchar(64) COLLATE utf8_bin NOT NULL,
  `table_name` varchar(64) COLLATE utf8_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Hidden items of navigation tree';

-- --------------------------------------------------------

--
-- Estrutura da tabela `pma__pdf_pages`
--

CREATE TABLE `pma__pdf_pages` (
  `db_name` varchar(64) COLLATE utf8_bin NOT NULL DEFAULT '',
  `page_nr` int(10) UNSIGNED NOT NULL,
  `page_descr` varchar(50) CHARACTER SET utf8 NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='PDF relation pages for phpMyAdmin';

-- --------------------------------------------------------

--
-- Estrutura da tabela `pma__recent`
--

CREATE TABLE `pma__recent` (
  `username` varchar(64) COLLATE utf8_bin NOT NULL,
  `tables` text COLLATE utf8_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Recently accessed tables';

--
-- Extraindo dados da tabela `pma__recent`
--

INSERT INTO `pma__recent` (`username`, `tables`) VALUES
('root', '[{\"db\":\"feira-tecnologica-2026-turma-a\",\"table\":\"alunos\"},{\"db\":\"feira-tecnologica-2026-turma-a\",\"table\":\"serie\"},{\"db\":\"feira-tecnologica-2026-turma-a\",\"table\":\"serie_projetos\"},{\"db\":\"feira-tecnologica-2026-turma-a\",\"table\":\"alunos_projetos\"},{\"db\":\"feira-tecnologica-2026-turma-a\",\"table\":\"ponto_vizinho\"},{\"db\":\"feira-tecnologica-2026-turma-a\",\"table\":\"projetos\"},{\"db\":\"feira-tecnologica-2026-turma-a\",\"table\":\"stand\"},{\"db\":\"feira-tecnologica-2026-turma-a\",\"table\":\"ods_projetos\"},{\"db\":\"feira-tecnologica-2026-turma-a\",\"table\":\"ods\"},{\"db\":\"feira-tecnologica-2026-turma-a\",\"table\":\"curso\"}]');

-- --------------------------------------------------------

--
-- Estrutura da tabela `pma__relation`
--

CREATE TABLE `pma__relation` (
  `master_db` varchar(64) COLLATE utf8_bin NOT NULL DEFAULT '',
  `master_table` varchar(64) COLLATE utf8_bin NOT NULL DEFAULT '',
  `master_field` varchar(64) COLLATE utf8_bin NOT NULL DEFAULT '',
  `foreign_db` varchar(64) COLLATE utf8_bin NOT NULL DEFAULT '',
  `foreign_table` varchar(64) COLLATE utf8_bin NOT NULL DEFAULT '',
  `foreign_field` varchar(64) COLLATE utf8_bin NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Relation table';

-- --------------------------------------------------------

--
-- Estrutura da tabela `pma__savedsearches`
--

CREATE TABLE `pma__savedsearches` (
  `id` int(5) UNSIGNED NOT NULL,
  `username` varchar(64) COLLATE utf8_bin NOT NULL DEFAULT '',
  `db_name` varchar(64) COLLATE utf8_bin NOT NULL DEFAULT '',
  `search_name` varchar(64) COLLATE utf8_bin NOT NULL DEFAULT '',
  `search_data` text COLLATE utf8_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Saved searches';

-- --------------------------------------------------------

--
-- Estrutura da tabela `pma__table_coords`
--

CREATE TABLE `pma__table_coords` (
  `db_name` varchar(64) COLLATE utf8_bin NOT NULL DEFAULT '',
  `table_name` varchar(64) COLLATE utf8_bin NOT NULL DEFAULT '',
  `pdf_page_number` int(11) NOT NULL DEFAULT 0,
  `x` float UNSIGNED NOT NULL DEFAULT 0,
  `y` float UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Table coordinates for phpMyAdmin PDF output';

-- --------------------------------------------------------

--
-- Estrutura da tabela `pma__table_info`
--

CREATE TABLE `pma__table_info` (
  `db_name` varchar(64) COLLATE utf8_bin NOT NULL DEFAULT '',
  `table_name` varchar(64) COLLATE utf8_bin NOT NULL DEFAULT '',
  `display_field` varchar(64) COLLATE utf8_bin NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Table information for phpMyAdmin';

-- --------------------------------------------------------

--
-- Estrutura da tabela `pma__table_uiprefs`
--

CREATE TABLE `pma__table_uiprefs` (
  `username` varchar(64) COLLATE utf8_bin NOT NULL,
  `db_name` varchar(64) COLLATE utf8_bin NOT NULL,
  `table_name` varchar(64) COLLATE utf8_bin NOT NULL,
  `prefs` text COLLATE utf8_bin NOT NULL,
  `last_update` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Tables'' UI preferences';

-- --------------------------------------------------------

--
-- Estrutura da tabela `pma__tracking`
--

CREATE TABLE `pma__tracking` (
  `db_name` varchar(64) COLLATE utf8_bin NOT NULL,
  `table_name` varchar(64) COLLATE utf8_bin NOT NULL,
  `version` int(10) UNSIGNED NOT NULL,
  `date_created` datetime NOT NULL,
  `date_updated` datetime NOT NULL,
  `schema_snapshot` text COLLATE utf8_bin NOT NULL,
  `schema_sql` text COLLATE utf8_bin DEFAULT NULL,
  `data_sql` longtext COLLATE utf8_bin DEFAULT NULL,
  `tracking` set('UPDATE','REPLACE','INSERT','DELETE','TRUNCATE','CREATE DATABASE','ALTER DATABASE','DROP DATABASE','CREATE TABLE','ALTER TABLE','RENAME TABLE','DROP TABLE','CREATE INDEX','DROP INDEX','CREATE VIEW','ALTER VIEW','DROP VIEW') COLLATE utf8_bin DEFAULT NULL,
  `tracking_active` int(1) UNSIGNED NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Database changes tracking for phpMyAdmin';

-- --------------------------------------------------------

--
-- Estrutura da tabela `pma__userconfig`
--

CREATE TABLE `pma__userconfig` (
  `username` varchar(64) COLLATE utf8_bin NOT NULL,
  `timevalue` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `config_data` text COLLATE utf8_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='User preferences storage for phpMyAdmin';

--
-- Extraindo dados da tabela `pma__userconfig`
--

INSERT INTO `pma__userconfig` (`username`, `timevalue`, `config_data`) VALUES
('root', '2026-09-02 13:28:22', '{\"Console\\/Mode\":\"collapse\",\"lang\":\"pt\",\"Export\\/file_template_server\":\"banco-3c\"}');

-- --------------------------------------------------------

--
-- Estrutura da tabela `pma__usergroups`
--

CREATE TABLE `pma__usergroups` (
  `usergroup` varchar(64) COLLATE utf8_bin NOT NULL,
  `tab` varchar(64) COLLATE utf8_bin NOT NULL,
  `allowed` enum('Y','N') COLLATE utf8_bin NOT NULL DEFAULT 'N'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='User groups with configured menu items';

-- --------------------------------------------------------

--
-- Estrutura da tabela `pma__users`
--

CREATE TABLE `pma__users` (
  `username` varchar(64) COLLATE utf8_bin NOT NULL,
  `usergroup` varchar(64) COLLATE utf8_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Users and their assignments to user groups';

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `pma__bookmark`
--
ALTER TABLE `pma__bookmark`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `pma__central_columns`
--
ALTER TABLE `pma__central_columns`
  ADD PRIMARY KEY (`db_name`,`col_name`);

--
-- Índices para tabela `pma__column_info`
--
ALTER TABLE `pma__column_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `db_name` (`db_name`,`table_name`,`column_name`);

--
-- Índices para tabela `pma__designer_settings`
--
ALTER TABLE `pma__designer_settings`
  ADD PRIMARY KEY (`username`);

--
-- Índices para tabela `pma__export_templates`
--
ALTER TABLE `pma__export_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `u_user_type_template` (`username`,`export_type`,`template_name`);

--
-- Índices para tabela `pma__favorite`
--
ALTER TABLE `pma__favorite`
  ADD PRIMARY KEY (`username`);

--
-- Índices para tabela `pma__history`
--
ALTER TABLE `pma__history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `username` (`username`,`db`,`table`,`timevalue`);

--
-- Índices para tabela `pma__navigationhiding`
--
ALTER TABLE `pma__navigationhiding`
  ADD PRIMARY KEY (`username`,`item_name`,`item_type`,`db_name`,`table_name`);

--
-- Índices para tabela `pma__pdf_pages`
--
ALTER TABLE `pma__pdf_pages`
  ADD PRIMARY KEY (`page_nr`),
  ADD KEY `db_name` (`db_name`);

--
-- Índices para tabela `pma__recent`
--
ALTER TABLE `pma__recent`
  ADD PRIMARY KEY (`username`);

--
-- Índices para tabela `pma__relation`
--
ALTER TABLE `pma__relation`
  ADD PRIMARY KEY (`master_db`,`master_table`,`master_field`),
  ADD KEY `foreign_field` (`foreign_db`,`foreign_table`);

--
-- Índices para tabela `pma__savedsearches`
--
ALTER TABLE `pma__savedsearches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `u_savedsearches_username_dbname` (`username`,`db_name`,`search_name`);

--
-- Índices para tabela `pma__table_coords`
--
ALTER TABLE `pma__table_coords`
  ADD PRIMARY KEY (`db_name`,`table_name`,`pdf_page_number`);

--
-- Índices para tabela `pma__table_info`
--
ALTER TABLE `pma__table_info`
  ADD PRIMARY KEY (`db_name`,`table_name`);

--
-- Índices para tabela `pma__table_uiprefs`
--
ALTER TABLE `pma__table_uiprefs`
  ADD PRIMARY KEY (`username`,`db_name`,`table_name`);

--
-- Índices para tabela `pma__tracking`
--
ALTER TABLE `pma__tracking`
  ADD PRIMARY KEY (`db_name`,`table_name`,`version`);

--
-- Índices para tabela `pma__userconfig`
--
ALTER TABLE `pma__userconfig`
  ADD PRIMARY KEY (`username`);

--
-- Índices para tabela `pma__usergroups`
--
ALTER TABLE `pma__usergroups`
  ADD PRIMARY KEY (`usergroup`,`tab`,`allowed`);

--
-- Índices para tabela `pma__users`
--
ALTER TABLE `pma__users`
  ADD PRIMARY KEY (`username`,`usergroup`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `pma__bookmark`
--
ALTER TABLE `pma__bookmark`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `pma__column_info`
--
ALTER TABLE `pma__column_info`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `pma__export_templates`
--
ALTER TABLE `pma__export_templates`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `pma__history`
--
ALTER TABLE `pma__history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `pma__pdf_pages`
--
ALTER TABLE `pma__pdf_pages`
  MODIFY `page_nr` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `pma__savedsearches`
--
ALTER TABLE `pma__savedsearches`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- Banco de dados: `test`
--
CREATE DATABASE IF NOT EXISTS `test` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `test`;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
