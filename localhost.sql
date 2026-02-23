-- Taria Health - Production Database Schema
-- Use this file to initialize your gledcapi_activation database.

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- 1. Users Table (Authentication)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Corporates Table
CREATE TABLE IF NOT EXISTS `corporates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `wellness_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_wellness_date` (`wellness_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Registrations (Participants)
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
  INDEX `idx_corporate` (`corporate_id`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Vitals Table
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
  INDEX `idx_registration_vitals` (`registration_id`),
  INDEX `idx_measured_at` (`measured_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Nutritions Table
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
  `body_fat_percent` decimal(5,2) DEFAULT NULL,
  `meal_plan` enum('Recommended','Not Recommended') DEFAULT NULL,
  `weight_loss_period` varchar(50) DEFAULT NULL,
  `notes_nutritionist` text DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`registration_id`) REFERENCES `registrations`(`id`) ON DELETE CASCADE,
  INDEX `idx_registration_nutri` (`registration_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Clinicals Table
CREATE TABLE IF NOT EXISTS `clinicals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `registration_id` int NOT NULL,
  `counselling_sessions` enum('Recommended','Not Recommended') DEFAULT NULL,
  `verbal_stress_rating` int DEFAULT NULL,
  `conclusion` varchar(255) DEFAULT NULL,
  `doctor_notes` text DEFAULT NULL,
  `wellness_check_type` varchar(100) DEFAULT 'None',
  `user_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`registration_id`) REFERENCES `registrations`(`id`) ON DELETE CASCADE,
  INDEX `idx_registration_clinical` (`registration_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INITIAL SEED DATA
INSERT INTO `users` (`name`, `email`, `password`, `role`) VALUES 
('Taria Admin', 'admin@superadmin.com', '$2a$10$CWKTgxLJJux6m6Sq6.vLnuC2WpSrqWpSrqWpSrqWpSrqWpSrqWpSr', 'admin');

INSERT INTO `corporates` (`name`, `wellness_date`) VALUES 
('Bio Food Products', '2025-09-29'),
('Taria', '2025-10-01'),
('NCBA', '2026-02-02');

COMMIT;
