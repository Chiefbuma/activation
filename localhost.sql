-- Taria Health Compass - Production Database Schema
-- Database: gledcapi_activation

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------

-- Table structure for table `users`
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','staff','physician','navigator','payer') NOT NULL DEFAULT 'staff',
  `avatarUrl` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `corporates`
CREATE TABLE `corporates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `wellness_date` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `registrations`
CREATE TABLE `registrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `surname` varchar(100) DEFAULT NULL,
  `sex` enum('Male','Female','Other') DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `corporate_id` int(11) DEFAULT NULL,
  `wellness_date` date DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `corporate_id` (`corporate_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `registrations_ibfk_1` FOREIGN KEY (`corporate_id`) REFERENCES `corporates` (`id`) ON DELETE SET NULL,
  CONSTRAINT `registrations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `vitals`
CREATE TABLE `vitals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `registration_id` int(11) NOT NULL,
  `bp_systolic` int(11) DEFAULT NULL,
  `bp_diastolic` int(11) DEFAULT NULL,
  `pulse` int(11) DEFAULT NULL,
  `temp` decimal(4,1) DEFAULT NULL,
  `rbs` varchar(20) DEFAULT NULL,
  `fbs` varchar(20) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `measured_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `registration_id` (`registration_id`),
  CONSTRAINT `vitals_ibfk_1` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `nutritions`
CREATE TABLE `nutritions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `registration_id` int(11) NOT NULL,
  `height` int(11) DEFAULT NULL,
  `weight` decimal(5,2) DEFAULT NULL,
  `bmi` decimal(5,2) DEFAULT NULL,
  `llw` decimal(5,2) DEFAULT NULL,
  `ulw` decimal(5,2) DEFAULT NULL,
  `excess_weight` decimal(5,2) DEFAULT NULL,
  `visceral_fat` int(11) DEFAULT NULL,
  `body_fat_percent` decimal(5,2) DEFAULT NULL,
  `meal_plan` enum('Recommended','Not Recommended') DEFAULT NULL,
  `weight_loss_period` varchar(50) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `registration_id` (`registration_id`),
  CONSTRAINT `nutritions_ibfk_1` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table structure for table `clinicals`
CREATE TABLE `clinicals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `registration_id` int(11) NOT NULL,
  `counselling_sessions` enum('Recommended','Not Recommended') DEFAULT NULL,
  `verbal_stress_rating` int(11) DEFAULT NULL,
  `conclusion` text DEFAULT NULL,
  `doctor_notes` text DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `registration_id` (`registration_id`),
  CONSTRAINT `clinicals_ibfk_1` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

-- Initial Seed Data
-- Initial Admin (Password: password)
INSERT INTO `users` (`name`, `email`, `password`, `role`) VALUES
('Taria Admin', 'admin@superadmin.com', '$2a$10$CWKTgxLJJux6m6Sq6.vLnuC2WpSrqWpSrqWpSrqWpSrqWpSrqWpSr', 'admin');

-- Sample Corporates
INSERT INTO `corporates` (`name`, `wellness_date`) VALUES
('Bio Food Products', '2025-09-29'),
('Taria', '2025-10-01'),
('NCBA', '2026-02-02');

COMMIT;
