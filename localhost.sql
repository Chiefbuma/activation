-- Taria Health - Production Schema Alignment
-- Includes all clinical parameters and performance indexes

CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','staff','physician','navigator','payer') NOT NULL DEFAULT 'staff',
  `avatarUrl` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `corporates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `wellness_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_corp_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `registrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `surname` varchar(100) DEFAULT NULL,
  `sex` enum('Male','Female','Other') DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `age` int DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `corporate_id` int DEFAULT NULL,
  `wellness_date` date DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`corporate_id`) REFERENCES `corporates`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_reg_created` (`created_at`),
  INDEX `idx_reg_name` (`first_name`, `surname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `vitals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `registration_id` int NOT NULL,
  `bp_systolic` int DEFAULT NULL,
  `bp_diastolic` int DEFAULT NULL,
  `pulse` int DEFAULT NULL,
  `temp` decimal(4,1) DEFAULT NULL,
  `rbs` varchar(20) DEFAULT NULL,
  `fbs` varchar(20) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `measured_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`registration_id`) REFERENCES `registrations`(`id`) ON DELETE CASCADE,
  INDEX `idx_vitals_reg` (`registration_id`),
  INDEX `idx_vitals_measured` (`measured_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `nutritions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `registration_id` int NOT NULL,
  `height` int DEFAULT NULL,
  `weight` decimal(5,2) DEFAULT NULL,
  `bmi` decimal(5,2) DEFAULT NULL,
  `llw` decimal(5,2) DEFAULT NULL,
  `ulw` decimal(5,2) DEFAULT NULL,
  `excess_weight` decimal(5,2) DEFAULT NULL,
  `visceral_fat` int DEFAULT NULL,
  `body_fat_percent` decimal(4,1) DEFAULT NULL,
  `meal_plan` enum('Recommended','Not Recommended') DEFAULT NULL,
  `weight_loss_period` varchar(50) DEFAULT NULL,
  `notes_nutritionist` text DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`registration_id`) REFERENCES `registrations`(`id`) ON DELETE CASCADE,
  INDEX `idx_nutri_reg` (`registration_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `clinicals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `registration_id` int NOT NULL,
  `counselling_sessions` enum('Recommended','Not Recommended') DEFAULT NULL,
  `verbal_stress_rating` int DEFAULT NULL,
  `conclusion` varchar(255) DEFAULT NULL,
  `doctor_notes` text DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`registration_id`) REFERENCES `registrations`(`id`) ON DELETE CASCADE,
  INDEX `idx_clinical_reg` (`registration_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Initial Seed Data
INSERT INTO `users` (`name`, `email`, `password`, `role`) VALUES 
('Taria Admin', 'admin@superadmin.com', '$2a$10$CWKTgxLJJux6m6Sq6.vLnuC2WpSrqWpSrqWpSrqWpSrqWpSrqWpSr', 'admin');

INSERT INTO `corporates` (`name`, `wellness_date`) VALUES 
('Bio Food Products', '2025-09-29'),
('Taria', '2025-10-01'),
('NCBA', '2026-02-02');
