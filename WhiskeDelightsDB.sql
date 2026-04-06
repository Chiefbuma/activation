-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: mysql
-- Generation Time: Feb 01, 2026 at 06:49 AM
-- Server version: 8.0.45
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `WhiskeDelightsDB`
--

-- --------------------------------------------------------

--
-- Table structure for table `clinicals`
--

CREATE TABLE `clinicals` (
  `id` int NOT NULL,
  `registration_id` int NOT NULL,
  `notes_psychologist` text,
  `notes_doctor` text,
  `user_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `clinicals`
--

INSERT INTO `clinicals` (`id`, `registration_id`, `notes_psychologist`, `notes_doctor`, `user_id`, `created_at`, `updated_at`) VALUES
(2, 2, 'Patient is showing signs of anxiety related to his new diagnosis. Provided resources for stress management.', 'Diagnosed with Stage 1 Hypertension. Prescribed Lisinopril 10mg. Advised on lifestyle modifications, particularly diet and exercise. Follow up in 1 month to check BP.', 1, '2026-01-31 14:03:10', '2026-01-31 14:03:10'),
(4, 3, 'Psychologist\'s Notes', 'Doctor\'s Notes', 1, '2026-02-01 06:44:04', '2026-02-01 06:44:04'),
(5, 5, 'Psychologist\'s Notes', 'Doctor\'s Notes', 1, '2026-02-01 06:45:58', '2026-02-01 06:45:58');

-- --------------------------------------------------------

--
-- Table structure for table `corporates`
--

CREATE TABLE `corporates` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `wellness_date` date NOT NULL,
  `expected_participants` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `corporates`
--

INSERT INTO `corporates` (`id`, `name`, `wellness_date`, `expected_participants`, `created_at`, `updated_at`) VALUES
(1, 'Bio Food Products', '2025-09-29', 180, '2026-01-31 14:03:10', '2026-01-31 14:03:10'),
(3, 'Taria', '2025-10-01', 150, '2026-01-31 14:03:10', '2026-01-31 14:03:10'),
(5, 'NCBA', '2026-02-02', 220, '2026-02-01 05:58:15', '2026-02-01 05:58:15');

-- --------------------------------------------------------

--
-- Table structure for table `goals`
--

CREATE TABLE `goals` (
  `id` int NOT NULL,
  `registration_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `discussion` text,
  `goal` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `goals`
--

INSERT INTO `goals` (`id`, `registration_id`, `user_id`, `discussion`, `goal`, `created_at`, `updated_at`) VALUES
(2, 2, 1, 'Patient is concerned about his high blood pressure reading and wants to manage it better.', 'Reduce daily sodium intake to under 2,300mg. Monitor blood pressure at home weekly and keep a log.', '2026-01-31 14:03:10', '2026-01-31 14:03:10'),
(4, 3, 1, '8994', '7884', '2026-02-01 06:43:48', '2026-02-01 06:43:48'),
(5, 5, 1, 'Discussion', 'Goal', '2026-02-01 06:45:49', '2026-02-01 06:45:49');

-- --------------------------------------------------------

--
-- Table structure for table `nutritions`
--

CREATE TABLE `nutritions` (
  `id` int NOT NULL,
  `registration_id` int NOT NULL,
  `height` float DEFAULT NULL,
  `weight` float DEFAULT NULL,
  `bmi` float DEFAULT NULL,
  `visceral_fat` float DEFAULT NULL,
  `body_fat_percent` float DEFAULT NULL,
  `notes_nutritionist` text,
  `user_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `nutritions`
--

INSERT INTO `nutritions` (`id`, `registration_id`, `height`, `weight`, `bmi`, `visceral_fat`, `body_fat_percent`, `notes_nutritionist`, `user_id`, `created_at`, `updated_at`) VALUES
(2, 2, 175, 84, 27, NULL, NULL, NULL, NULL, '2026-01-31 14:03:10', '2026-01-31 14:03:10'),
(3, 3, 169, 81, 28, NULL, NULL, 'ecouraged on excercise', NULL, '2026-01-31 14:03:10', '2026-01-31 14:03:10'),
(4, 4, 181, 74.8, 23, 6, 18.5, 'encouraged on exercise', NULL, '2026-01-31 14:03:10', '2026-01-31 14:03:10'),
(7, 5, 45, 23, 113.6, 45, 12, 'Nutritionist Notes', NULL, '2026-02-01 06:45:27', '2026-02-01 06:45:27');

-- --------------------------------------------------------

--
-- Table structure for table `registrations`
--

CREATE TABLE `registrations` (
  `id` int NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `middle_name` varchar(255) DEFAULT NULL,
  `surname` varchar(255) DEFAULT NULL,
  `sex` enum('Male','Female','Other') DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `age` int DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `corporate_id` int DEFAULT NULL,
  `wellness_date` date DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `registrations`
--

INSERT INTO `registrations` (`id`, `first_name`, `middle_name`, `surname`, `sex`, `dob`, `age`, `phone`, `email`, `corporate_id`, `wellness_date`, `user_id`, `created_at`, `updated_at`) VALUES
(2, 'Tom', 'Mbalala', 'Wawire', 'Male', '1970-01-01', 55, '729089363', 'tommbalala@20.com', 1, NULL, NULL, '2026-01-31 14:03:10', '2026-01-31 14:03:10'),
(3, 'Euticus', 'Matumbi', 'Muthuri', 'Male', '1991-01-01', 34, '742025594', 'matumbieutychus@gmail.com', NULL, '2026-02-15', NULL, '2026-01-31 14:03:10', '2026-02-01 06:19:58'),
(4, 'Paul', NULL, 'Ratemo', 'Male', '1985-01-01', 40, '743760460', 'paulratemo84@gmail.com', NULL, '2026-02-02', NULL, '2026-01-31 14:03:10', '2026-02-01 06:46:41'),
(5, 'Kingsley', 'Matumbi', 'Otieno', 'Male', '1976-01-01', 49, '724785997', 'nyakrojala@gmail.com', 5, '2026-02-02', NULL, '2026-01-31 14:03:10', '2026-02-01 06:44:53');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` enum('admin','staff','navigator','payer','physician') NOT NULL DEFAULT 'staff',
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `role`, `password`, `created_at`, `updated_at`) VALUES
(1, 'Taria Admin', 'admin@superadmin.com', 'admin', '$2b$10$W3a1ZyygMwNhyty8RnROH.7sfbVEAdO5qrHVNh./.vAn2346k.ClW', '2026-01-31 14:03:10', '2026-01-31 14:03:10'),
(2, 'buma', 'georgebuma.jb@gmail.com', 'staff', '$2a$10$8ojrbBVb8dsdeU000GPC.OJsZiDBVuaa03PkHcYiaHUK1v/6aWoim', '2026-01-31 14:53:13', '2026-02-01 05:54:23');

-- --------------------------------------------------------

--
-- Table structure for table `vitals`
--

CREATE TABLE `vitals` (
  `id` int NOT NULL,
  `registration_id` int NOT NULL,
  `bp_systolic` int DEFAULT NULL,
  `bp_diastolic` int DEFAULT NULL,
  `pulse` int DEFAULT NULL,
  `temp` float DEFAULT NULL,
  `rbs` varchar(255) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `measured_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `vitals`
--

INSERT INTO `vitals` (`id`, `registration_id`, `bp_systolic`, `bp_diastolic`, `pulse`, `temp`, `rbs`, `user_id`, `measured_at`, `created_at`, `updated_at`) VALUES
(2, 2, 150, 99, 62, 36.4, '6.2', NULL, '2026-01-31 14:03:10', '2026-01-31 14:03:10', '2026-01-31 14:03:10'),
(3, 3, 133, 81, 70, 36.1, 'NOT SUPPORTED', NULL, '2026-01-31 14:03:10', '2026-01-31 14:03:10', '2026-01-31 14:03:10'),
(4, 4, 135, 89, 74, 37, '5.5', NULL, '2026-01-31 14:03:10', '2026-01-31 14:03:10', '2026-01-31 14:03:10'),
(5, 5, 171, 118, 76, 37, '5.8', NULL, '2026-01-31 14:03:10', '2026-01-31 14:03:10', '2026-01-31 14:03:10');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `clinicals`
--
ALTER TABLE `clinicals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `registration_id` (`registration_id`);

--
-- Indexes for table `corporates`
--
ALTER TABLE `corporates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `goals`
--
ALTER TABLE `goals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `registration_id` (`registration_id`);

--
-- Indexes for table `nutritions`
--
ALTER TABLE `nutritions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `registration_id` (`registration_id`);

--
-- Indexes for table `registrations`
--
ALTER TABLE `registrations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `corporate_id` (`corporate_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `vitals`
--
ALTER TABLE `vitals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `registration_id` (`registration_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `clinicals`
--
ALTER TABLE `clinicals`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `corporates`
--
ALTER TABLE `corporates`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `goals`
--
ALTER TABLE `goals`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `nutritions`
--
ALTER TABLE `nutritions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `registrations`
--
ALTER TABLE `registrations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `vitals`
--
ALTER TABLE `vitals`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `clinicals`
--
ALTER TABLE `clinicals`
  ADD CONSTRAINT `clinicals_ibfk_1` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `goals`
--
ALTER TABLE `goals`
  ADD CONSTRAINT `goals_ibfk_1` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `nutritions`
--
ALTER TABLE `nutritions`
  ADD CONSTRAINT `nutritions_ibfk_1` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `registrations`
--
ALTER TABLE `registrations`
  ADD CONSTRAINT `registrations_ibfk_1` FOREIGN KEY (`corporate_id`) REFERENCES `corporates` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `vitals`
--
ALTER TABLE `vitals`
  ADD CONSTRAINT `vitals_ibfk_1` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
