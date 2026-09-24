-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 08-Set-2026 às 00:12
-- Versão do servidor: 10.4.32-MariaDB
-- versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `banco_manha`
--
CREATE DATABASE IF NOT EXISTS `banco_manha` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `banco_manha`;

-- --------------------------------------------------------

--
-- Estrutura da tabela `alunos`
--

CREATE TABLE `alunos` (
  `id_aluno` int(11) NOT NULL,
  `nome_aluno` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `alunos`
--

INSERT INTO `alunos` (`id_aluno`, `nome_aluno`) VALUES
(1, 'Byanca'),
(2, 'Beatriz Krisan'),
(3, 'Ana Clara'),
(4, 'Gabriely'),
(5, 'Adriano'),
(6, 'Thais'),
(7, 'Nicole'),
(8, 'Vitor Lopes'),
(9, 'Vitor Goncalves'),
(10, 'Kaio'),
(11, 'Felipe'),
(12, 'Daniel'),
(13, 'Gabriel'),
(14, 'Izan'),
(15, 'Allyson'),
(16, 'Beatriz Bertoldo'),
(17, 'Emilio'),
(18, 'Giovana L'),
(19, 'Daniely');

-- --------------------------------------------------------

--
-- Estrutura da tabela `alunos_projetos`
--

CREATE TABLE `alunos_projetos` (
  `id_aluno` int(11) NOT NULL,
  `id_projeto` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `alunos_projetos`
--

INSERT INTO `alunos_projetos` (`id_aluno`, `id_projeto`) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 1),
(5, 1),
(6, 2),
(7, 2),
(8, 2),
(9, 2),
(10, 2),
(11, 3),
(12, 3),
(13, 3),
(14, 3),
(15, 3),
(16, 4),
(17, 4),
(18, 4),
(19, 4);

-- --------------------------------------------------------

--
-- Estrutura da tabela `aluno_curso`
--

CREATE TABLE `aluno_curso` (
  `id_aluno` int(11) NOT NULL,
  `id_curso` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `aluno_curso`
--

INSERT INTO `aluno_curso` (`id_aluno`, `id_curso`) VALUES
(1, 3),
(2, 3),
(3, 3),
(4, 3),
(5, 3),
(6, 3),
(7, 3),
(8, 3),
(9, 3),
(10, 3),
(11, 3),
(12, 3),
(13, 3),
(14, 3),
(15, 3),
(16, 1),
(17, 1),
(18, 1),
(19, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `aluno_serie`
--

CREATE TABLE `aluno_serie` (
  `id_aluno` int(11) NOT NULL,
  `id_serie` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `aluno_serie`
--

INSERT INTO `aluno_serie` (`id_aluno`, `id_serie`) VALUES
(1, 14),
(2, 14),
(3, 14),
(4, 14),
(5, 14),
(6, 14),
(7, 14),
(8, 14),
(9, 14),
(10, 14),
(11, 14),
(12, 14),
(13, 14),
(14, 14),
(15, 14),
(16, 12),
(17, 12),
(18, 12),
(19, 12);

-- --------------------------------------------------------

--
-- Estrutura da tabela `curso`
--

CREATE TABLE `curso` (
  `id_curso` int(11) NOT NULL,
  `nome_curso` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `curso`
--

INSERT INTO `curso` (`id_curso`, `nome_curso`) VALUES
(1, 'Administração'),
(2, 'Recursos Humanos'),
(3, 'Informática para Internet'),
(4, 'Química');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `localizacao`
--

CREATE TABLE `localizacao` (
  `id_localizacao` int(11) NOT NULL,
  `local` varchar(255) DEFAULT NULL,
  `bloco` varchar(10) DEFAULT NULL,
  `numero_sala` varchar(20) DEFAULT NULL,
  `andar` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `localizacao`
--

INSERT INTO `localizacao` (`id_localizacao`, `local`, `bloco`, `numero_sala`, `andar`) VALUES
(1, 'Sala de aula', 'A', '2', '1'),
(2, 'Sala de aula', 'A', '5', '1');

-- --------------------------------------------------------

--
-- Estrutura da tabela `ods`
--

CREATE TABLE `ods` (
  `numero_ods` int(11) NOT NULL,
  `nome_ods` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `ods`
--

INSERT INTO `ods` (`numero_ods`, `nome_ods`) VALUES
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
  `id_projeto` int(11) NOT NULL,
  `numero_ods` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `ods_projetos`
--

INSERT INTO `ods_projetos` (`id_projeto`, `numero_ods`) VALUES
(1, 16),
(2, 4),
(3, 16),
(4, 16);

-- --------------------------------------------------------

--
-- Estrutura da tabela `periodo_votacao`
--

CREATE TABLE `periodo_votacao` (
  `id_periodo` int(11) NOT NULL,
  `data_inicio` datetime NOT NULL,
  `data_encerramento` datetime NOT NULL,
  `andamento` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `ponto`
--

CREATE TABLE `ponto` (
  `id_ponto` int(11) NOT NULL,
  `x` decimal(10,2) DEFAULT NULL,
  `y` decimal(10,2) DEFAULT NULL,
  `id_localizacao` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `ponto_vizinho`
--

CREATE TABLE `ponto_vizinho` (
  `id_ponto` int(11) NOT NULL,
  `id_ponto_vizinho` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `projetos`
--

CREATE TABLE `projetos` (
  `id_projeto` int(11) NOT NULL,
  `turno` varchar(255) DEFAULT NULL,
  `nome_projeto` varchar(255) DEFAULT NULL,
  `descricao` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `projetos`
--

INSERT INTO `projetos` (`id_projeto`, `turno`, `nome_projeto`, `descricao`) VALUES
(1, 'Manhã', 'Valid', 'plataforma para autenticação de documentos'),
(2, 'Manhã', 'Orion', 'plataforma de musica'),
(3, 'Manhã', 'Coroa Afro', 'plataforma voltada a empreendedores negros'),
(4, 'Manhã', 'Coroa Afro', 'projeto voltado a empreendedores negros');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `serie`
--

CREATE TABLE `serie` (
  `id_serie` int(11) NOT NULL,
  `nome_serie` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `serie`
--

INSERT INTO `serie` (`id_serie`, `nome_serie`) VALUES
(1, '1°A'),
(2, '1°B'),
(3, '1°C'),
(4, '1°E'),
(5, '1°F'),
(6, '1°I'),
(7, '2°A'),
(8, '2°B'),
(9, '2°C'),
(10, '2°F'),
(11, '2°I'),
(12, '3°A'),
(13, '3°B'),
(14, '3°C'),
(15, '3°F'),
(16, '3°I'),
(26, '2°F'),
(27, '2°I'),
(28, '3°A'),
(29, '3°B'),
(30, '3°C'),
(31, '3°F'),
(32, '3°I');

-- --------------------------------------------------------

--
-- Estrutura da tabela `stande`
--

CREATE TABLE `stande` (
  `id_stande` int(11) NOT NULL,
  `num_stande` int(11) NOT NULL,
  `id_localizacao` int(11) NOT NULL,
  `id_projeto` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `stande`
--

INSERT INTO `stande` (`id_stande`, `num_stande`, `id_localizacao`, `id_projeto`) VALUES
(1, 1, 1, 1),
(2, 2, 1, 2),
(3, 3, 1, 3),
(4, 1, 2, 4);

-- --------------------------------------------------------

--
-- Estrutura da tabela `visitante`
--

CREATE TABLE `visitante` (
  `id_visitante` int(11) NOT NULL,
  `ip` varchar(45) NOT NULL,
  `modelo_dispositivo` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `alunos`
--
ALTER TABLE `alunos`
  ADD PRIMARY KEY (`id_aluno`);

--
-- Índices para tabela `alunos_projetos`
--
ALTER TABLE `alunos_projetos`
  ADD PRIMARY KEY (`id_aluno`,`id_projeto`),
  ADD KEY `id_projeto` (`id_projeto`);

--
-- Índices para tabela `aluno_curso`
--
ALTER TABLE `aluno_curso`
  ADD PRIMARY KEY (`id_aluno`,`id_curso`),
  ADD KEY `id_curso` (`id_curso`);

--
-- Índices para tabela `aluno_serie`
--
ALTER TABLE `aluno_serie`
  ADD PRIMARY KEY (`id_aluno`,`id_serie`),
  ADD KEY `id_serie` (`id_serie`);

--
-- Índices para tabela `curso`
--
ALTER TABLE `curso`
  ADD PRIMARY KEY (`id_curso`);

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
-- Índices para tabela `ods`
--
ALTER TABLE `ods`
  ADD PRIMARY KEY (`numero_ods`);

--
-- Índices para tabela `ods_projetos`
--
ALTER TABLE `ods_projetos`
  ADD PRIMARY KEY (`id_projeto`,`numero_ods`),
  ADD KEY `numero_ods` (`numero_ods`);

--
-- Índices para tabela `periodo_votacao`
--
ALTER TABLE `periodo_votacao`
  ADD PRIMARY KEY (`id_periodo`);

--
-- Índices para tabela `ponto`
--
ALTER TABLE `ponto`
  ADD PRIMARY KEY (`id_ponto`),
  ADD KEY `id_localizacao` (`id_localizacao`);

--
-- Índices para tabela `ponto_vizinho`
--
ALTER TABLE `ponto_vizinho`
  ADD PRIMARY KEY (`id_ponto`,`id_ponto_vizinho`),
  ADD KEY `id_ponto_vizinho` (`id_ponto_vizinho`);

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
-- Índices para tabela `stande`
--
ALTER TABLE `stande`
  ADD PRIMARY KEY (`id_stande`),
  ADD KEY `id_localizacao` (`id_localizacao`),
  ADD KEY `id_projeto` (`id_projeto`);

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
  MODIFY `id_aluno` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de tabela `curso`
--
ALTER TABLE `curso`
  MODIFY `id_curso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `curtidas`
--
ALTER TABLE `curtidas`
  MODIFY `id_curtida` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `localizacao`
--
ALTER TABLE `localizacao`
  MODIFY `id_localizacao` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `periodo_votacao`
--
ALTER TABLE `periodo_votacao`
  MODIFY `id_periodo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `ponto`
--
ALTER TABLE `ponto`
  MODIFY `id_ponto` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `projetos`
--
ALTER TABLE `projetos`
  MODIFY `id_projeto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `resultado`
--
ALTER TABLE `resultado`
  MODIFY `id_resultado` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `serie`
--
ALTER TABLE `serie`
  MODIFY `id_serie` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT de tabela `stande`
--
ALTER TABLE `stande`
  MODIFY `id_stande` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `visitante`
--
ALTER TABLE `visitante`
  MODIFY `id_visitante` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restrições para despejos de tabelas
--

--
-- Limitadores para a tabela `alunos_projetos`
--
ALTER TABLE `alunos_projetos`
  ADD CONSTRAINT `alunos_projetos_ibfk_1` FOREIGN KEY (`id_aluno`) REFERENCES `alunos` (`id_aluno`),
  ADD CONSTRAINT `alunos_projetos_ibfk_2` FOREIGN KEY (`id_projeto`) REFERENCES `projetos` (`id_projeto`);

--
-- Limitadores para a tabela `aluno_curso`
--
ALTER TABLE `aluno_curso`
  ADD CONSTRAINT `aluno_curso_ibfk_1` FOREIGN KEY (`id_aluno`) REFERENCES `alunos` (`id_aluno`),
  ADD CONSTRAINT `aluno_curso_ibfk_2` FOREIGN KEY (`id_curso`) REFERENCES `curso` (`id_curso`);

--
-- Limitadores para a tabela `aluno_serie`
--
ALTER TABLE `aluno_serie`
  ADD CONSTRAINT `aluno_serie_ibfk_1` FOREIGN KEY (`id_aluno`) REFERENCES `alunos` (`id_aluno`),
  ADD CONSTRAINT `aluno_serie_ibfk_2` FOREIGN KEY (`id_serie`) REFERENCES `serie` (`id_serie`);

--
-- Limitadores para a tabela `curtidas`
--
ALTER TABLE `curtidas`
  ADD CONSTRAINT `curtidas_ibfk_1` FOREIGN KEY (`id_visitante`) REFERENCES `visitante` (`id_visitante`),
  ADD CONSTRAINT `curtidas_ibfk_2` FOREIGN KEY (`id_projeto`) REFERENCES `projetos` (`id_projeto`),
  ADD CONSTRAINT `curtidas_ibfk_3` FOREIGN KEY (`id_periodo`) REFERENCES `periodo_votacao` (`id_periodo`);

--
-- Limitadores para a tabela `ods_projetos`
--
ALTER TABLE `ods_projetos`
  ADD CONSTRAINT `ods_projetos_ibfk_1` FOREIGN KEY (`id_projeto`) REFERENCES `projetos` (`id_projeto`),
  ADD CONSTRAINT `ods_projetos_ibfk_2` FOREIGN KEY (`numero_ods`) REFERENCES `ods` (`numero_ods`);

--
-- Limitadores para a tabela `ponto`
--
ALTER TABLE `ponto`
  ADD CONSTRAINT `ponto_ibfk_1` FOREIGN KEY (`id_localizacao`) REFERENCES `localizacao` (`id_localizacao`);

--
-- Limitadores para a tabela `ponto_vizinho`
--
ALTER TABLE `ponto_vizinho`
  ADD CONSTRAINT `ponto_vizinho_ibfk_1` FOREIGN KEY (`id_ponto`) REFERENCES `ponto` (`id_ponto`),
  ADD CONSTRAINT `ponto_vizinho_ibfk_2` FOREIGN KEY (`id_ponto_vizinho`) REFERENCES `ponto` (`id_ponto`);

--
-- Limitadores para a tabela `resultado`
--
ALTER TABLE `resultado`
  ADD CONSTRAINT `resultado_ibfk_1` FOREIGN KEY (`id_projeto`) REFERENCES `projetos` (`id_projeto`);

--
-- Limitadores para a tabela `stande`
--
ALTER TABLE `stande`
  ADD CONSTRAINT `stande_ibfk_1` FOREIGN KEY (`id_localizacao`) REFERENCES `localizacao` (`id_localizacao`),
  ADD CONSTRAINT `stande_ibfk_2` FOREIGN KEY (`id_projeto`) REFERENCES `projetos` (`id_projeto`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
