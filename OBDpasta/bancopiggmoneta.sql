-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           10.4.24-MariaDB - mariadb.org binary distribution
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Copiando estrutura do banco de dados para piggmoneta
CREATE DATABASE IF NOT EXISTS `piggmoneta` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE `piggmoneta`;

-- Copiando estrutura para tabela piggmoneta.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `senha` varchar(255) DEFAULT NULL,
  `cargo` enum('usuario','admin') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario` (`usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;

-- Copiando dados para a tabela piggmoneta.usuarios: ~6 rows (aproximadamente)
INSERT INTO `usuarios` (`id`, `nome`, `usuario`, `email`, `senha`, `cargo`) VALUES
	(1, NULL, NULL, NULL, '$2y$10$7USSXsxflq2QJvbJmEL0ZurP6MpZT4ToOtSIaCBJ/OBm1ENqpUN2O', NULL),
	(2, 'joao carlos', 'carlos', 'calos@gmail.com', '$2y$10$7mhODNaWIhYAHQrweZmmpe074UXceiKNUEbxxR/s0M9MN.QvF0kZC', 'admin'),
	(3, 'yan alves', 'yan', 'yangay@gmail', '$2y$10$A0tvup6pS.uHfDrH9rw9ZOaIN9ahOLhUcf2LmXKmt5aQBGIm8RUqq', 'usuario'),
	(4, 'hok', 'hok', 'hok@gmail.com', '$2y$10$i5KzJ6/zL2qiLz0FbkNNz.EIPrLTCUCgPLvgxFAySRW4Sbx3eytJG', 'usuario'),
	(5, 'cu do yan', 'yan viado', 'yan@gmail.com', '$2y$10$eXRN62MEQKXFv7jfJC7JquiiWIAdgERQbhNVxPFWtBPBAH9YFoKa.', 'usuario'),
	(6, 'matheus viado', 'viado matheus', 'cudomatheusemeu@gmail.com', '$2y$10$4atVJIuaXrrW7FVe1Fmz1e934sLu1KcWcrk.aQyFc0eaLvvQLsUJW', 'usuario');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
