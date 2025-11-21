CREATE DATABASE IF NOT EXISTS `video-server` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `video-server`;
CREATE TABLE `video` (
  `id` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `file_url` varchar(512) DEFAULT NULL,
  `cover_url` varchar(512) DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `status` int DEFAULT '1',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
