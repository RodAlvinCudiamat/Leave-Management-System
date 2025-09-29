-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: leave_management
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `attendance_log_exceptions`
--

DROP TABLE IF EXISTS `attendance_log_exceptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_log_exceptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `attendance_log_id` int NOT NULL,
  `hours` decimal(6,2) NOT NULL,
  `is_overtime` tinyint(1) NOT NULL DEFAULT '1',
  `valid_until_at` date DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_attendance_log_exceptions_attendance_logs1_idx` (`attendance_log_id`),
  CONSTRAINT `fk_attendance_log_exceptions_attendance_logs1` FOREIGN KEY (`attendance_log_id`) REFERENCES `attendance_logs` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_log_exceptions`
--

LOCK TABLES `attendance_log_exceptions` WRITE;
/*!40000 ALTER TABLE `attendance_log_exceptions` DISABLE KEYS */;
INSERT INTO `attendance_log_exceptions` VALUES (2,6,7.82,0,NULL,'2025-09-24 03:28:37','2025-09-24 03:28:37'),(3,7,8.00,0,NULL,'2025-09-24 04:11:47','2025-09-24 04:11:47'),(12,10,7.96,0,NULL,'2025-09-25 20:50:10','2025-09-25 20:50:10'),(13,8,13.46,1,'2026-09-24','2025-09-25 20:51:19','2025-09-25 20:51:19'),(14,11,5.50,0,NULL,'2025-09-25 23:21:17','2025-09-25 23:21:17'),(15,12,7.96,0,NULL,'2025-09-25 23:23:57','2025-09-25 23:23:57'),(17,13,7.94,0,NULL,'2025-09-25 23:28:39','2025-09-25 23:28:39'),(18,14,8.00,0,NULL,'2025-09-25 23:33:31','2025-09-25 23:33:31'),(19,15,8.00,0,NULL,'2025-09-25 23:37:39','2025-09-25 23:37:39'),(20,16,7.85,0,NULL,'2025-09-25 23:52:13','2025-09-25 23:52:13');
/*!40000 ALTER TABLE `attendance_log_exceptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance_logs`
--

DROP TABLE IF EXISTS `attendance_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `time_in` datetime NOT NULL,
  `time_out` datetime DEFAULT NULL,
  `date` date DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_attendance_logs_employees1_idx` (`employee_id`),
  CONSTRAINT `fk_attendance_logs_employees1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_logs`
--

LOCK TABLES `attendance_logs` WRITE;
/*!40000 ALTER TABLE `attendance_logs` DISABLE KEYS */;
INSERT INTO `attendance_logs` VALUES (1,11,'2025-09-24 01:32:55','2025-09-24 02:57:49',NULL,'2025-09-24 01:32:55','2025-09-24 02:57:49'),(2,11,'2025-09-24 02:59:00','2025-09-24 02:59:05',NULL,'2025-09-24 02:59:00','2025-09-24 02:59:04'),(3,11,'2025-09-24 03:04:09','2025-09-24 03:04:40',NULL,'2025-09-24 03:04:08','2025-09-24 03:04:40'),(4,11,'2025-09-24 03:04:55','2025-09-24 03:06:25',NULL,'2025-09-24 03:04:55','2025-09-24 03:06:24'),(5,11,'2025-09-24 03:07:28','2025-09-24 03:12:25',NULL,'2025-09-24 03:07:28','2025-09-24 03:12:24'),(6,11,'2025-09-24 03:17:59','2025-09-24 03:28:38',NULL,'2025-09-24 03:17:59','2025-09-24 03:28:37'),(7,10,'2025-09-24 04:11:42','2025-09-24 04:11:47','2025-09-24','2025-09-24 04:11:42','2025-09-24 04:11:47'),(8,11,'2025-09-24 23:23:32','2025-09-25 20:51:20','2025-09-25','2025-09-24 23:23:31','2025-09-25 20:51:19'),(9,10,'2025-09-25 05:38:07','2025-09-25 20:43:16','2025-09-25','2025-09-25 05:38:07','2025-09-25 20:43:15'),(10,10,'2025-09-25 20:47:38','2025-09-25 20:50:11','2025-09-26','2025-09-25 20:47:37','2025-09-25 20:50:10'),(11,10,'2025-09-25 20:51:03','2025-09-25 23:21:18','2025-09-26','2025-09-25 20:51:02','2025-09-25 23:21:17'),(12,10,'2025-09-25 23:21:26','2025-09-25 23:23:57','2025-09-26','2025-09-25 23:21:25','2025-09-25 23:23:57'),(13,10,'2025-09-25 23:25:05','2025-09-25 23:28:40','2025-09-26','2025-09-25 23:25:04','2025-09-25 23:28:39'),(14,10,'2025-09-25 23:33:29','2025-09-25 23:33:31','2025-09-26','2025-09-25 23:33:28','2025-09-25 23:33:31'),(15,10,'2025-09-25 23:37:37','2025-09-25 23:37:39','2025-09-26','2025-09-25 23:37:37','2025-09-25 23:37:39'),(16,11,'2025-09-25 23:43:09','2025-09-25 23:52:14','2025-09-26','2025-09-25 23:43:09','2025-09-25 23:52:13');
/*!40000 ALTER TABLE `attendance_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_departments`
--

DROP TABLE IF EXISTS `employee_departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_departments`
--

LOCK TABLES `employee_departments` WRITE;
/*!40000 ALTER TABLE `employee_departments` DISABLE KEYS */;
INSERT INTO `employee_departments` VALUES (1,'Mobile Development','2025-09-18 03:46:52','2025-09-18 03:46:52'),(2,'Web Development','2025-09-18 03:46:52','2025-09-18 03:46:52'),(3,'Game Development','2025-09-18 03:46:52','2025-09-18 03:46:52'),(4,'Quality Assurance','2025-09-18 03:46:52','2025-09-18 03:46:52'),(5,'Technical Support','2025-09-18 03:46:52','2025-09-18 03:46:52'),(6,'Sales and Marketing','2025-09-18 03:46:52','2025-09-18 03:46:52');
/*!40000 ALTER TABLE `employee_departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_leave_balances`
--

DROP TABLE IF EXISTS `employee_leave_balances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_leave_balances` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `leave_type_id` int NOT NULL,
  `starting_credit` decimal(8,2) NOT NULL DEFAULT '0.00',
  `earned` decimal(8,2) DEFAULT '0.00',
  `used` decimal(8,2) DEFAULT '0.00',
  `deducted` decimal(8,2) DEFAULT '0.00',
  `carry_in` decimal(8,2) DEFAULT '0.00',
  `remaining_credit` decimal(8,2) DEFAULT '0.00',
  `year` year DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_employee_leave_balances_employees1_idx` (`employee_id`),
  KEY `fk_employee_leave_balances_leave_types1_idx` (`leave_type_id`),
  CONSTRAINT `fk_employee_leave_balances_employees1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `fk_employee_leave_balances_leave_types1` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_leave_balances`
--

LOCK TABLES `employee_leave_balances` WRITE;
/*!40000 ALTER TABLE `employee_leave_balances` DISABLE KEYS */;
INSERT INTO `employee_leave_balances` VALUES (1,8,1,1.25,1.25,0.00,0.00,0.00,2.50,NULL,'2025-09-19 05:44:08','2025-09-25 01:10:00'),(2,8,2,1.25,1.25,0.00,0.00,0.00,2.50,NULL,'2025-09-19 05:44:08','2025-09-25 01:10:00'),(3,8,6,3.00,0.00,0.00,0.00,0.00,3.00,NULL,'2025-09-19 05:44:08','2025-09-19 05:44:08'),(4,8,7,7.00,0.00,0.00,0.00,0.00,7.00,NULL,'2025-09-19 05:44:08','2025-09-19 05:44:08'),(5,8,12,5.00,0.00,0.00,0.00,0.00,5.00,NULL,'2025-09-19 05:44:08','2025-09-19 05:44:08'),(6,8,14,0.00,0.00,0.00,0.00,0.00,0.00,NULL,'2025-09-19 05:44:08','2025-09-19 05:44:08'),(7,9,1,1.25,0.00,0.00,0.00,5.00,6.25,2025,'2025-09-19 05:56:46','2025-09-25 01:40:59'),(8,9,2,1.25,0.00,0.00,0.00,5.00,6.25,2025,'2025-09-19 05:56:46','2025-09-25 01:40:59'),(9,9,6,3.00,0.00,0.00,0.00,0.00,3.00,2025,'2025-09-19 05:56:46','2025-09-19 05:56:46'),(10,9,7,7.00,0.00,0.00,0.00,0.00,7.00,2025,'2025-09-19 05:56:46','2025-09-19 05:56:46'),(11,9,12,5.00,0.00,0.00,0.00,0.00,5.00,2025,'2025-09-19 05:56:46','2025-09-19 05:56:46'),(12,9,14,0.00,0.00,0.00,0.00,0.00,0.00,2025,'2025-09-19 05:56:46','2025-09-19 05:56:46'),(13,10,1,1.25,1.25,1.00,0.00,0.00,1.50,2025,'2025-09-22 22:27:15','2025-09-25 01:10:00'),(14,10,2,1.25,1.25,0.00,0.00,0.00,2.50,2025,'2025-09-22 22:27:15','2025-09-25 01:10:00'),(15,10,6,3.00,0.00,0.00,0.00,0.00,3.00,2025,'2025-09-22 22:27:15','2025-09-22 22:27:15'),(16,10,7,7.00,0.00,0.00,0.00,0.00,7.00,2025,'2025-09-22 22:27:15','2025-09-22 22:27:15'),(17,10,12,5.00,0.00,1.00,0.00,0.00,4.00,2025,'2025-09-22 22:27:15','2025-09-24 22:50:20'),(18,10,14,0.00,0.00,53.36,0.00,0.00,-53.36,2025,'2025-09-22 22:27:15','2025-09-25 23:37:39'),(19,10,8,10.00,0.00,3.00,0.00,0.00,7.00,2025,'2025-09-23 23:38:09','2025-09-24 05:37:45'),(20,11,1,1.25,1.25,0.00,0.00,0.00,2.50,2025,'2025-09-23 23:44:20','2025-09-25 01:10:00'),(21,11,2,1.25,1.25,0.00,0.00,0.00,2.50,2025,'2025-09-23 23:44:20','2025-09-25 01:10:00'),(22,11,6,3.00,0.00,0.00,0.00,0.00,3.00,2025,'2025-09-23 23:44:20','2025-09-23 23:44:20'),(23,11,7,7.00,0.00,0.00,0.00,0.00,7.00,2025,'2025-09-23 23:44:20','2025-09-23 23:44:20'),(24,11,12,5.00,0.00,0.00,0.00,0.00,5.00,2025,'2025-09-23 23:44:20','2025-09-23 23:44:20'),(25,11,14,0.00,20.19,15.67,0.00,0.00,4.52,2025,'2025-09-23 23:44:20','2025-09-25 23:52:13'),(26,11,4,105.00,0.00,4.00,0.00,0.00,101.00,2025,'2025-09-23 23:46:11','2025-09-25 23:38:07'),(27,10,10,180.00,0.00,0.00,0.00,0.00,180.00,2025,'2025-09-24 22:58:42','2025-09-24 22:58:42'),(28,11,9,10.00,0.00,0.00,0.00,0.00,10.00,2025,'2025-09-24 23:13:29','2025-09-24 23:13:29'),(29,14,1,1.25,0.00,0.00,0.00,0.00,1.25,2025,'2025-09-25 23:08:54','2025-09-25 23:08:54'),(30,14,2,1.25,0.00,0.00,0.00,0.00,1.25,2025,'2025-09-25 23:08:54','2025-09-25 23:08:54'),(31,14,6,3.00,0.00,0.00,0.00,0.00,3.00,2025,'2025-09-25 23:08:54','2025-09-25 23:08:54'),(32,14,7,7.00,0.00,0.00,0.00,0.00,7.00,2025,'2025-09-25 23:08:54','2025-09-25 23:08:54'),(33,14,12,5.00,0.00,0.00,0.00,0.00,5.00,2025,'2025-09-25 23:08:54','2025-09-25 23:08:54'),(34,14,14,0.00,0.00,0.00,0.00,0.00,0.00,2025,'2025-09-25 23:08:54','2025-09-25 23:08:54');
/*!40000 ALTER TABLE `employee_leave_balances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_positions`
--

DROP TABLE IF EXISTS `employee_positions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_positions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_positions`
--

LOCK TABLES `employee_positions` WRITE;
/*!40000 ALTER TABLE `employee_positions` DISABLE KEYS */;
INSERT INTO `employee_positions` VALUES (1,'Chief Executive Officer (CEO)','2025-09-18 03:55:04','2025-09-18 03:55:04'),(2,'Chief Technology Officer (CTO)','2025-09-18 03:55:04','2025-09-18 03:55:04'),(3,'Project Manager','2025-09-18 03:55:04','2025-09-18 03:55:04'),(4,'Software Engineer','2025-09-18 03:55:04','2025-09-18 03:55:04'),(5,'Frontend Developer','2025-09-18 03:55:04','2025-09-18 03:55:04'),(6,'Backend Developer','2025-09-18 03:55:04','2025-09-18 03:55:04'),(7,'Full Stack Developer','2025-09-18 03:55:04','2025-09-18 03:55:04'),(8,'Mobile-App Developer','2025-09-18 03:55:04','2025-09-18 03:55:04'),(9,'UI/UX Designer','2025-09-18 03:55:04','2025-09-18 03:55:04'),(10,'Quality Assurance Analyst','2025-09-18 03:55:04','2025-09-18 03:55:04'),(11,'DevOps Engineer','2025-09-18 03:55:04','2025-09-18 03:55:04'),(12,'System Administrator','2025-09-18 03:55:04','2025-09-18 03:55:04'),(13,'IT Support Specialist','2025-09-18 03:55:04','2025-09-18 03:55:04'),(14,'Data Analyst','2025-09-18 03:55:04','2025-09-18 03:55:04');
/*!40000 ALTER TABLE `employee_positions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_roles`
--

DROP TABLE IF EXISTS `employee_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(105) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_roles`
--

LOCK TABLES `employee_roles` WRITE;
/*!40000 ALTER TABLE `employee_roles` DISABLE KEYS */;
INSERT INTO `employee_roles` VALUES (1,'admin','2025-09-18 03:48:09','2025-09-18 03:48:09'),(2,'employee','2025-09-18 03:48:09','2025-09-18 03:48:09');
/*!40000 ALTER TABLE `employee_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_role_id` int NOT NULL,
  `employee_department_id` int NOT NULL,
  `employee_position_id` int NOT NULL,
  `first_name` varchar(105) NOT NULL,
  `last_name` varchar(105) NOT NULL,
  `gender` enum('Male','Female') NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `hired_at` datetime NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_employees_employee_roles_idx` (`employee_role_id`),
  KEY `fk_employees_employee_positions1_idx` (`employee_position_id`),
  KEY `fk_employees_employee_departments1_idx` (`employee_department_id`),
  CONSTRAINT `fk_employees_employee_departments1` FOREIGN KEY (`employee_department_id`) REFERENCES `employee_departments` (`id`),
  CONSTRAINT `fk_employees_employee_positions1` FOREIGN KEY (`employee_position_id`) REFERENCES `employee_positions` (`id`),
  CONSTRAINT `fk_employees_employee_roles` FOREIGN KEY (`employee_role_id`) REFERENCES `employee_roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,1,4,4,'Bakol','Bakol','Male','bakol@gmail.com','12345',1,'2025-09-18 23:19:16','2025-09-18 23:19:16','2025-09-18 23:19:16'),(2,1,2,6,'Rod','Cudiamat','Male','rodcudiamat@gmail.com','$2b$10$yvP6u80bkyRxEFFXPN3UCupU6ep4.mdA/arf5xVNjc9NOhmuwH5Qa',1,'2025-10-01 00:00:00','2025-09-19 04:38:17','2025-09-19 04:38:17'),(3,2,5,6,'Kurt','Martinez','Male','kurt@gmail.com','$2b$10$hIIMcHLMt6.KaXfcOi77teBZbd/Bh/VKNlZXsn7pZ1YsM5IXwdfCq',1,'2025-09-30 00:00:00','2025-09-19 04:46:00','2025-09-19 04:46:00'),(4,2,4,3,'Joseph','Neil','Male','joseph@gmail.com','$2b$10$6cBj5qddGEod9SSfsLbnW.Cg1mTrveZtAsAtgoOBSvUBbKUY2QlT6',1,'2025-09-25 00:00:00','2025-09-19 05:19:36','2025-09-19 05:19:36'),(5,2,4,7,'sdanjndas','asdasd','Male','saddad@gmail.com','$2b$10$lsLBYByWBHQ/v92DD41Xv.kjBgGOTxDCP.9QbncYaPLE2CotajWA2',0,'2025-10-02 00:00:00','2025-09-19 05:20:45','2025-09-19 05:20:45'),(6,2,2,7,'sadasd','sdasd','Male','asdasd@gmail.com','$2b$10$QQ6kBbwBbtDnsxaCPaFj5uxTVz1fsWllQzOVegHubPMqJ2XdQLZmi',1,'2025-10-08 00:00:00','2025-09-19 05:24:03','2025-09-19 05:24:03'),(7,2,5,8,'sdadad','asdad','Male','dsfsdf@gmail.com','$2b$10$hh8EBS.1YMotEQMbSlQt6ugInND4yVZWXQzUehVdaJspomoiPV6kG',1,'2025-10-02 00:00:00','2025-09-19 05:24:52','2025-09-19 05:24:52'),(8,2,5,6,'adasd','asdad','Male','asdadsa@gmail.com','$2b$10$m8RNurhxyxPwjm3GFXvTAOpZ86AlfcynThos.BdhI9EL6GIEv5/jq',0,'2025-10-11 00:00:00','2025-09-19 05:44:08','2025-09-19 05:44:08'),(9,2,3,4,'asdasd','sdadfdfg','Male','dfgfgd@gmail.com','$2b$10$VZLrwzBA56oihzQVZxWi8etD/lSUNW.atlNVlcqlEQoj92KBtvAG2',1,'2025-10-03 00:00:00','2025-09-19 05:56:46','2025-09-19 05:56:46'),(10,2,3,5,'Kyle','De Jesus','Male','kyle@gmail.com','$2b$10$X3oA.J141PQJVikNgLe4ueMEijefGcrh4vTWfGoH05WTgFFn6SnmS',1,'2025-09-23 00:00:00','2025-09-22 22:27:15','2025-09-22 22:27:15'),(11,2,2,6,'Maria','Juana','Female','maria@gmail.com','$2b$10$fz88T77g67r.IcWJogmWjeKnn27DYbD0FNJPcGDm9f9ZhM4eonLZm',1,'2025-10-01 00:00:00','2025-09-23 23:44:20','2025-09-25 05:00:35'),(12,2,2,6,'Nick','Estong','Male','nick@gmail.com','$2b$10$03wJQ2QknWZiPIKu9RtdZ.tXpN3972FncxDBBVLq42zYW7Lo799mO',1,'2025-10-02 00:00:00','2025-09-25 22:52:13','2025-09-25 22:52:13'),(13,2,4,6,'asdas','sdds','Male','ndfssand@gmail.com','$2b$10$46wk8oVm9U4GodP6EF0d..cDMeEWFKKorv0didyAvmuuWcShbWvta',1,'2025-10-02 00:00:00','2025-09-25 23:06:41','2025-09-25 23:06:41'),(14,2,4,6,'Yanna','Claire','Female','yanna@gmail.com','$2b$10$ZcCjttJw3rSc5T.7GfYZHOUs97GfryGgX6F/On70Gxlz6PpezW6BS',1,'2025-10-22 00:00:00','2025-09-25 23:08:54','2025-09-25 23:09:18');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `holiday_types`
--

DROP TABLE IF EXISTS `holiday_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `holiday_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `holiday_types`
--

LOCK TABLES `holiday_types` WRITE;
/*!40000 ALTER TABLE `holiday_types` DISABLE KEYS */;
INSERT INTO `holiday_types` VALUES (1,'regular','2025-09-18 03:36:13','2025-09-18 03:36:13'),(2,'special non-working','2025-09-18 03:36:13','2025-09-18 03:36:13'),(3,'earn','2025-09-18 03:38:54','2025-09-18 03:38:54'),(4,'use','2025-09-18 03:38:54','2025-09-18 03:38:54'),(5,'deduct','2025-09-18 03:38:54','2025-09-18 03:38:54');
/*!40000 ALTER TABLE `holiday_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `holidays`
--

DROP TABLE IF EXISTS `holidays`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `holidays` (
  `id` int NOT NULL AUTO_INCREMENT,
  `holiday_type_id` int NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_holidays_holiday_types1_idx` (`holiday_type_id`),
  CONSTRAINT `fk_holidays_holiday_types1` FOREIGN KEY (`holiday_type_id`) REFERENCES `holiday_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `holidays`
--

LOCK TABLES `holidays` WRITE;
/*!40000 ALTER TABLE `holidays` DISABLE KEYS */;
INSERT INTO `holidays` VALUES (1,1,'New Year\'s Day','2025-01-01','2025-09-18 04:02:07','2025-09-18 04:02:07'),(2,2,'EDSA People Power Revolution Anniversary','2025-02-25','2025-09-18 04:08:45','2025-09-18 04:08:45'),(3,1,'Maundy Thursday','2025-04-17','2025-09-18 04:12:22','2025-09-18 04:12:22'),(4,1,'Good Friday','2025-04-18','2025-09-18 04:12:22','2025-09-18 04:12:22'),(5,1,'Araw ng Kagitingan (Day of Valor)','2025-04-09','2025-09-18 04:12:22','2025-09-18 04:12:22'),(6,1,'Labor Day','2025-05-01','2025-09-18 04:12:22','2025-09-18 04:12:22'),(7,1,'Independence Day','2025-06-12','2025-09-18 04:12:22','2025-09-18 04:12:22'),(8,1,'National Heroes Day','2025-08-25','2025-09-18 04:12:22','2025-09-18 04:12:22'),(9,1,'Bonifacio Day','2025-11-30','2025-09-18 04:12:22','2025-09-18 04:12:22'),(10,1,'Christmas Day','2025-12-25','2025-09-18 04:12:22','2025-09-18 04:12:22'),(11,1,'Rizal Day','2025-12-30','2025-09-18 04:12:22','2025-09-18 04:12:22'),(12,2,'Chinese New Year','2025-01-29','2025-09-18 04:12:22','2025-09-18 04:12:22'),(13,2,'Black Saturday','2025-04-19','2025-09-18 04:12:22','2025-09-18 04:12:22'),(14,2,'Ninoy Aquino Day','2025-08-21','2025-09-18 04:12:22','2025-09-18 04:12:22'),(15,2,'All Saints\' Day','2025-11-01','2025-09-18 04:12:22','2025-09-18 04:12:22'),(16,2,'Feast of the Immaculate Conception of the Blessed Virgin Mary','2025-12-08','2025-09-18 04:12:22','2025-09-18 04:12:22'),(17,2,'Christmas Eve','2025-12-24','2025-09-18 04:12:22','2025-09-18 04:12:22'),(18,2,'New Year\'s Eve','2025-12-31','2025-09-18 04:12:22','2025-09-18 04:12:22');
/*!40000 ALTER TABLE `holidays` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_application_days`
--

DROP TABLE IF EXISTS `leave_application_days`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_application_days` (
  `id` int NOT NULL AUTO_INCREMENT,
  `leave_application_id` int NOT NULL,
  `leave_application_status_id` int NOT NULL,
  `approver_employee_id` int DEFAULT NULL,
  `day_in_fraction` decimal(3,2) NOT NULL DEFAULT '1.00',
  `is_workday` tinyint(1) NOT NULL DEFAULT '1',
  `is_holiday` tinyint(1) NOT NULL DEFAULT '0',
  `date` date NOT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_leave_application_days_leave_applications1_idx` (`leave_application_id`),
  KEY `fk_leave_application_days_leave_application_statuses1_idx` (`leave_application_status_id`),
  KEY `fk_leave_application_days_employees1_idx` (`approver_employee_id`),
  CONSTRAINT `fk_leave_application_days_employees1` FOREIGN KEY (`approver_employee_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `fk_leave_application_days_leave_application_statuses1` FOREIGN KEY (`leave_application_status_id`) REFERENCES `leave_application_statuses` (`id`),
  CONSTRAINT `fk_leave_application_days_leave_applications1` FOREIGN KEY (`leave_application_id`) REFERENCES `leave_applications` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_application_days`
--

LOCK TABLES `leave_application_days` WRITE;
/*!40000 ALTER TABLE `leave_application_days` DISABLE KEYS */;
INSERT INTO `leave_application_days` VALUES (1,13,2,2,1.00,1,0,'2025-09-30','2025-09-23 03:21:14','2025-09-22 23:50:01','2025-09-23 03:21:14'),(2,14,3,NULL,1.00,1,0,'2025-10-02',NULL,'2025-09-24 01:22:10','2025-09-24 01:30:07'),(3,14,2,2,1.00,1,0,'2025-10-03','2025-09-24 01:27:48','2025-09-24 01:22:10','2025-09-24 01:27:48'),(4,14,1,NULL,1.00,0,0,'2025-10-04',NULL,'2025-09-24 01:22:10','2025-09-24 01:22:10'),(5,14,1,NULL,1.00,0,0,'2025-10-05',NULL,'2025-09-24 01:22:10','2025-09-24 01:22:10'),(6,14,2,2,1.00,1,0,'2025-10-06','2025-09-24 01:28:02','2025-09-24 01:22:10','2025-09-24 01:28:02'),(7,15,1,NULL,1.00,1,0,'2025-09-24',NULL,'2025-09-24 04:48:34','2025-09-24 04:48:34'),(8,15,1,NULL,1.00,1,0,'2025-09-25',NULL,'2025-09-24 04:48:34','2025-09-24 04:48:34'),(9,15,1,NULL,1.00,1,0,'2025-09-26',NULL,'2025-09-24 04:48:34','2025-09-24 04:48:34'),(10,15,1,NULL,1.00,0,0,'2025-09-27',NULL,'2025-09-24 04:48:34','2025-09-24 04:48:34'),(11,15,1,NULL,1.00,0,0,'2025-09-28',NULL,'2025-09-24 04:48:34','2025-09-24 04:48:34'),(12,16,2,2,1.00,1,0,'2025-10-08','2025-09-24 05:37:42','2025-09-24 05:08:18','2025-09-24 05:37:42'),(13,16,2,2,1.00,1,0,'2025-10-09','2025-09-24 05:37:44','2025-09-24 05:08:18','2025-09-24 05:37:44'),(14,16,2,2,1.00,1,0,'2025-10-10','2025-09-24 05:37:45','2025-09-24 05:08:18','2025-09-24 05:37:45'),(15,16,1,NULL,1.00,0,0,'2025-10-11',NULL,'2025-09-24 05:08:18','2025-09-24 05:08:18'),(16,16,1,NULL,1.00,0,0,'2025-10-12',NULL,'2025-09-24 05:08:18','2025-09-24 05:08:18'),(17,17,4,NULL,1.00,1,0,'2025-10-01',NULL,'2025-09-24 22:09:36','2025-09-24 22:33:05'),(18,17,3,NULL,1.00,1,0,'2025-09-30',NULL,'2025-09-24 22:09:36','2025-09-24 22:09:53'),(19,18,2,2,1.00,1,0,'2025-09-24','2025-09-24 22:50:20','2025-09-24 22:36:09','2025-09-24 22:50:20'),(20,18,3,NULL,1.00,1,0,'2025-09-25',NULL,'2025-09-24 22:36:09','2025-09-24 22:50:27'),(21,18,4,NULL,1.00,1,0,'2025-09-26',NULL,'2025-09-24 22:36:09','2025-09-24 22:50:50'),(22,18,1,NULL,1.00,0,0,'2025-09-27',NULL,'2025-09-24 22:36:09','2025-09-24 22:36:09'),(23,18,1,NULL,1.00,0,0,'2025-09-28',NULL,'2025-09-24 22:36:09','2025-09-24 22:36:09'),(24,19,2,2,1.00,1,0,'2025-10-09','2025-09-24 22:57:57','2025-09-24 22:57:30','2025-09-24 22:57:57'),(25,19,2,2,1.00,1,0,'2025-10-10','2025-09-25 23:38:07','2025-09-24 22:57:30','2025-09-25 23:38:07'),(26,19,1,NULL,1.00,0,0,'2025-10-11',NULL,'2025-09-24 22:57:30','2025-09-24 22:57:30'),(27,19,1,NULL,1.00,0,0,'2025-10-12',NULL,'2025-09-24 22:57:30','2025-09-24 22:57:30'),(28,19,1,NULL,1.00,1,0,'2025-10-13',NULL,'2025-09-24 22:57:30','2025-09-24 22:57:30'),(29,19,1,NULL,1.00,1,0,'2025-10-14',NULL,'2025-09-24 22:57:30','2025-09-24 22:57:30'),(30,19,1,NULL,1.00,1,0,'2025-10-15',NULL,'2025-09-24 22:57:30','2025-09-24 22:57:30'),(31,19,1,NULL,1.00,1,0,'2025-10-16',NULL,'2025-09-24 22:57:30','2025-09-24 22:57:30'),(32,20,1,NULL,1.00,1,0,'2025-09-24',NULL,'2025-09-25 02:10:31','2025-09-25 02:10:31'),(33,21,1,NULL,1.00,1,0,'2025-10-21',NULL,'2025-09-26 00:02:48','2025-09-26 00:02:48'),(34,21,1,NULL,1.00,1,0,'2025-10-22',NULL,'2025-09-26 00:02:48','2025-09-26 00:02:48'),(35,21,1,NULL,1.00,1,0,'2025-10-23',NULL,'2025-09-26 00:02:48','2025-09-26 00:02:48');
/*!40000 ALTER TABLE `leave_application_days` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_application_statuses`
--

DROP TABLE IF EXISTS `leave_application_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_application_statuses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(105) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_application_statuses`
--

LOCK TABLES `leave_application_statuses` WRITE;
/*!40000 ALTER TABLE `leave_application_statuses` DISABLE KEYS */;
INSERT INTO `leave_application_statuses` VALUES (1,'submitted','2025-09-18 05:26:56','2025-09-18 05:26:56'),(2,'approved','2025-09-18 05:28:00','2025-09-18 05:28:00'),(3,'rejected','2025-09-18 05:28:00','2025-09-18 05:28:00'),(4,'cancelled','2025-09-18 05:28:00','2025-09-18 05:28:00');
/*!40000 ALTER TABLE `leave_application_statuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_applications`
--

DROP TABLE IF EXISTS `leave_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_applications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `leave_type_id` int NOT NULL,
  `reason` text NOT NULL,
  `is_pending` tinyint(1) DEFAULT '1',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `filed_at` datetime NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_leave_applications_employees1_idx` (`employee_id`),
  KEY `fk_leave_applications_leave_types1_idx` (`leave_type_id`),
  CONSTRAINT `fk_leave_applications_employees1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `fk_leave_applications_leave_types1` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_applications`
--

LOCK TABLES `leave_applications` WRITE;
/*!40000 ALTER TABLE `leave_applications` DISABLE KEYS */;
INSERT INTO `leave_applications` VALUES (13,10,1,'sdfsfs',0,'2025-10-01','2025-10-01','2025-09-22 23:50:01','2025-09-22 23:50:01','2025-09-22 23:50:01'),(14,11,4,'buntes ngani',0,'2025-10-03','2025-10-07','2025-09-24 01:22:10','2025-09-24 01:22:10','2025-09-24 01:22:10'),(15,10,8,'aaral daw',0,'2025-09-25','2025-09-29','2025-09-24 04:48:34','2025-09-24 04:48:34','2025-09-24 04:48:34'),(16,10,8,'study first',0,'2025-10-09','2025-10-13','2025-09-24 05:08:18','2025-09-24 05:08:18','2025-09-24 05:08:18'),(17,10,12,'bagyo',0,'2025-10-02','2025-10-01','2025-09-24 22:09:36','2025-09-24 22:09:36','2025-09-24 22:09:36'),(18,10,12,'sadad',0,'2025-09-25','2025-09-29','2025-09-24 22:36:09','2025-09-24 22:36:09','2025-09-24 22:36:09'),(19,11,4,'manganganak na',1,'2025-10-10','2025-10-17','2025-09-24 22:57:30','2025-09-24 22:57:30','2025-09-24 22:57:30'),(20,10,2,'wdasdasda',1,'2025-09-25','2025-09-25','2025-09-25 02:10:31','2025-09-25 02:10:31','2025-09-25 02:10:31'),(21,11,4,'try overlap',1,'2025-10-22','2025-10-24','2025-09-26 00:02:48','2025-09-26 00:02:48','2025-09-26 00:02:48');
/*!40000 ALTER TABLE `leave_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_grant_requests`
--

DROP TABLE IF EXISTS `leave_grant_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_grant_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int DEFAULT NULL,
  `leave_type_id` int DEFAULT NULL,
  `leave_application_status_id` int DEFAULT '1',
  `requested_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_leave_request_employee` (`employee_id`),
  KEY `fk_leave_request_type` (`leave_type_id`),
  KEY `fk_leave_request_status` (`leave_application_status_id`),
  CONSTRAINT `fk_leave_request_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `fk_leave_request_status` FOREIGN KEY (`leave_application_status_id`) REFERENCES `leave_application_statuses` (`id`),
  CONSTRAINT `fk_leave_request_type` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_grant_requests`
--

LOCK TABLES `leave_grant_requests` WRITE;
/*!40000 ALTER TABLE `leave_grant_requests` DISABLE KEYS */;
INSERT INTO `leave_grant_requests` VALUES (1,10,3,2,NULL,'2025-09-23 05:37:41','2025-09-23 21:01:30'),(2,10,5,2,'2025-09-23 21:19:46','2025-09-23 21:19:46','2025-09-23 21:20:06'),(3,10,5,2,'2025-09-23 21:23:27','2025-09-23 21:23:27','2025-09-23 21:23:42'),(4,10,5,2,'2025-09-23 21:30:12','2025-09-23 21:30:12','2025-09-23 21:30:35'),(5,10,5,2,'2025-09-23 21:36:11','2025-09-23 21:36:11','2025-09-23 21:36:31'),(6,10,5,2,'2025-09-23 21:44:40','2025-09-23 21:44:40','2025-09-23 21:45:56'),(7,10,5,2,'2025-09-23 21:47:23','2025-09-23 21:47:23','2025-09-23 21:47:52'),(8,10,5,2,'2025-09-23 21:50:07','2025-09-23 21:50:07','2025-09-23 21:50:28'),(9,10,10,2,'2025-09-23 21:54:28','2025-09-23 21:54:28','2025-09-23 21:54:40'),(10,10,5,2,'2025-09-23 21:58:31','2025-09-23 21:58:31','2025-09-23 21:58:35'),(11,10,8,2,'2025-09-23 22:01:29','2025-09-23 22:01:29','2025-09-23 22:04:29'),(12,10,5,2,'2025-09-23 22:06:45','2025-09-23 22:06:45','2025-09-23 22:06:58'),(13,10,3,2,'2025-09-23 22:14:13','2025-09-23 22:14:13','2025-09-23 22:14:16'),(14,10,5,2,'2025-09-23 22:17:46','2025-09-23 22:17:46','2025-09-23 22:17:49'),(15,10,10,2,'2025-09-23 22:26:04','2025-09-23 22:26:04','2025-09-23 22:26:06'),(16,10,5,2,'2025-09-23 22:40:07','2025-09-23 22:40:07','2025-09-23 22:40:10'),(17,10,8,2,'2025-09-23 23:02:56','2025-09-23 23:02:56','2025-09-23 23:02:59'),(18,10,13,2,'2025-09-23 23:06:32','2025-09-23 23:06:32','2025-09-23 23:06:49'),(19,10,13,2,'2025-09-23 23:10:55','2025-09-23 23:10:55','2025-09-23 23:10:57'),(20,10,10,2,'2025-09-23 23:23:30','2025-09-23 23:23:30','2025-09-23 23:23:34'),(21,10,10,2,'2025-09-23 23:29:31','2025-09-23 23:29:31','2025-09-23 23:29:34'),(22,10,8,2,'2025-09-23 23:32:58','2025-09-23 23:32:58','2025-09-23 23:33:02'),(23,10,8,2,'2025-09-23 23:38:06','2025-09-23 23:38:06','2025-09-23 23:38:09'),(24,11,4,2,'2025-09-23 23:45:03','2025-09-23 23:45:03','2025-09-23 23:46:11'),(25,10,10,2,'2025-09-24 04:48:39','2025-09-24 04:48:39','2025-09-24 22:58:42'),(26,11,9,3,'2025-09-24 23:11:46','2025-09-24 23:11:46','2025-09-24 23:13:21'),(27,11,9,2,'2025-09-24 23:12:05','2025-09-24 23:12:05','2025-09-24 23:13:29'),(28,10,5,1,'2025-09-25 23:47:33','2025-09-25 23:47:33','2025-09-25 23:47:33');
/*!40000 ALTER TABLE `leave_grant_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_transaction_types`
--

DROP TABLE IF EXISTS `leave_transaction_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_transaction_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_transaction_types`
--

LOCK TABLES `leave_transaction_types` WRITE;
/*!40000 ALTER TABLE `leave_transaction_types` DISABLE KEYS */;
INSERT INTO `leave_transaction_types` VALUES (1,'earn','2025-09-18 05:29:53','2025-09-18 05:29:53'),(2,'use','2025-09-18 05:31:28','2025-09-18 05:31:28'),(3,'deduct','2025-09-18 05:31:28','2025-09-18 05:31:28');
/*!40000 ALTER TABLE `leave_transaction_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_transactions`
--

DROP TABLE IF EXISTS `leave_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `leave_application_id` int DEFAULT NULL,
  `leave_transaction_type_id` int NOT NULL,
  `leave_type_time_unit_id` int NOT NULL,
  `attendance_log_exception_id` int DEFAULT NULL,
  `quantity` decimal(8,2) NOT NULL,
  `date` date NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_leave_transactions_leave_applications1_idx` (`leave_application_id`),
  KEY `fk_leave_transactions_leave_transaction_types1_idx` (`leave_transaction_type_id`),
  KEY `fk_leave_transactions_leave_type_time_units1_idx` (`leave_type_time_unit_id`),
  KEY `fk_leave_transactions_attendance_log_exception_id_idx` (`attendance_log_exception_id`),
  CONSTRAINT `fk_leave_transactions_attendance_log_exception_id` FOREIGN KEY (`attendance_log_exception_id`) REFERENCES `attendance_log_exceptions` (`id`),
  CONSTRAINT `fk_leave_transactions_leave_applications1` FOREIGN KEY (`leave_application_id`) REFERENCES `leave_applications` (`id`),
  CONSTRAINT `fk_leave_transactions_leave_transaction_types1` FOREIGN KEY (`leave_transaction_type_id`) REFERENCES `leave_transaction_types` (`id`),
  CONSTRAINT `fk_leave_transactions_leave_type_time_units1` FOREIGN KEY (`leave_type_time_unit_id`) REFERENCES `leave_type_time_units` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_transactions`
--

LOCK TABLES `leave_transactions` WRITE;
/*!40000 ALTER TABLE `leave_transactions` DISABLE KEYS */;
INSERT INTO `leave_transactions` VALUES (1,13,2,1,NULL,1.00,'2025-09-23','2025-09-23 03:21:14','2025-09-23 03:21:14'),(2,14,2,1,NULL,1.00,'2025-09-24','2025-09-24 01:27:48','2025-09-24 01:27:48'),(3,14,2,1,NULL,1.00,'2025-09-24','2025-09-24 01:28:02','2025-09-24 01:28:02'),(5,NULL,2,2,2,7.82,'2025-09-24','2025-09-24 03:28:37','2025-09-24 03:28:37'),(6,NULL,3,2,3,8.00,'2025-09-24','2025-09-24 04:11:47','2025-09-24 04:11:47'),(7,16,2,1,NULL,1.00,'2025-09-24','2025-09-24 05:37:42','2025-09-24 05:37:42'),(8,16,2,1,NULL,1.00,'2025-09-24','2025-09-24 05:37:44','2025-09-24 05:37:44'),(9,16,2,1,NULL,1.00,'2025-09-24','2025-09-24 05:37:45','2025-09-24 05:37:45'),(10,18,2,1,NULL,1.00,'2025-09-24','2025-09-24 22:50:20','2025-09-24 22:50:20'),(11,19,2,1,NULL,1.00,'2025-09-24','2025-09-24 22:57:57','2025-09-24 22:57:57'),(20,NULL,3,2,NULL,7.96,'2025-09-25','2025-09-25 20:50:10','2025-09-25 20:50:10'),(21,NULL,1,2,NULL,13.46,'2025-09-25','2025-09-25 20:51:19','2025-09-25 20:51:19'),(22,NULL,3,2,NULL,5.50,'2025-09-25','2025-09-25 23:21:17','2025-09-25 23:21:17'),(23,NULL,3,2,NULL,7.96,'2025-09-25','2025-09-25 23:23:57','2025-09-25 23:23:57'),(25,NULL,3,2,NULL,7.94,'2025-09-25','2025-09-25 23:28:39','2025-09-25 23:28:39'),(26,NULL,3,2,NULL,8.00,'2025-09-25','2025-09-25 23:33:31','2025-09-25 23:33:31'),(27,NULL,3,2,19,8.00,'2025-09-25','2025-09-25 23:37:39','2025-09-25 23:37:39'),(28,19,2,1,NULL,1.00,'2025-09-25','2025-09-25 23:38:07','2025-09-25 23:38:07'),(29,NULL,3,2,20,7.85,'2025-09-25','2025-09-25 23:52:13','2025-09-25 23:52:13');
/*!40000 ALTER TABLE `leave_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_type_grant_basis`
--

DROP TABLE IF EXISTS `leave_type_grant_basis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_type_grant_basis` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(105) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_type_grant_basis`
--

LOCK TABLES `leave_type_grant_basis` WRITE;
/*!40000 ALTER TABLE `leave_type_grant_basis` DISABLE KEYS */;
INSERT INTO `leave_type_grant_basis` VALUES (1,'special','2025-09-18 03:33:25','2025-09-18 03:33:25'),(2,'monthly','2025-09-18 03:33:25','2025-09-18 03:33:25'),(3,'annual','2025-09-18 03:33:25','2025-09-18 03:33:25'),(4,'overtime_credit','2025-09-18 03:33:25','2025-09-18 03:33:25');
/*!40000 ALTER TABLE `leave_type_grant_basis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_type_time_units`
--

DROP TABLE IF EXISTS `leave_type_time_units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_type_time_units` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_type_time_units`
--

LOCK TABLES `leave_type_time_units` WRITE;
/*!40000 ALTER TABLE `leave_type_time_units` DISABLE KEYS */;
INSERT INTO `leave_type_time_units` VALUES (1,'day','2025-09-18 03:29:24','2025-09-18 03:29:24'),(2,'hour','2025-09-18 03:29:27','2025-09-18 03:29:27');
/*!40000 ALTER TABLE `leave_type_time_units` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_types`
--

DROP TABLE IF EXISTS `leave_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `leave_type_grant_basis_id` int NOT NULL,
  `leave_type_time_unit_id` int NOT NULL,
  `code` varchar(45) NOT NULL,
  `name` varchar(255) NOT NULL,
  `credit` decimal(5,2) NOT NULL,
  `notice_days` int NOT NULL DEFAULT '0',
  `overtime_multiplier` decimal(4,2) NOT NULL DEFAULT '0.00',
  `is_future_filing_allowed` tinyint(1) NOT NULL DEFAULT '1',
  `is_approval_needed` tinyint(1) NOT NULL DEFAULT '1',
  `is_carried_over` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_UNIQUE` (`code`),
  KEY `fk_leave_types_leave_type_grant_basis1_idx` (`leave_type_grant_basis_id`),
  KEY `fk_leave_types_leave_type_time_units1_idx` (`leave_type_time_unit_id`),
  CONSTRAINT `fk_leave_types_leave_type_grant_basis1` FOREIGN KEY (`leave_type_grant_basis_id`) REFERENCES `leave_type_grant_basis` (`id`),
  CONSTRAINT `fk_leave_types_leave_type_time_units1` FOREIGN KEY (`leave_type_time_unit_id`) REFERENCES `leave_type_time_units` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_types`
--

LOCK TABLES `leave_types` WRITE;
/*!40000 ALTER TABLE `leave_types` DISABLE KEYS */;
INSERT INTO `leave_types` VALUES (1,2,1,'VL','Vacation Leave',1.25,5,0.00,1,1,1,1,'2025-09-18 04:25:34','2025-09-25 23:12:09'),(2,2,1,'SL','Sick Leave',1.25,0,0.00,0,1,1,1,'2025-09-18 04:32:21','2025-09-18 04:32:21'),(3,1,1,'ML','Mandatory/Forced Leave',10.00,0,0.00,1,1,0,1,'2025-09-18 05:09:36','2025-09-18 05:09:36'),(4,1,1,'MAT','Maternity Leave',105.00,0,0.00,1,1,0,1,'2025-09-18 05:10:12','2025-09-18 05:10:12'),(5,1,1,'PAT','Paternity Leave',7.00,0,0.00,1,1,0,1,'2025-09-18 05:10:27','2025-09-18 05:10:27'),(6,3,1,'PL','Special Privilege Leave',3.00,0,0.00,1,1,0,1,'2025-09-18 05:11:11','2025-09-18 05:11:11'),(7,3,1,'SPL','Solo Parent Leave',7.00,0,0.00,1,1,0,1,'2025-09-18 05:12:14','2025-09-18 05:12:14'),(8,1,1,'STUDY','Study Leave',10.00,0,0.00,1,1,0,1,'2025-09-18 05:13:07','2025-09-18 05:13:07'),(9,1,1,'VAWC','10-Day VAWC (Violence Against Women and Children) Leave',10.00,0,0.00,1,1,0,1,'2025-09-18 05:14:12','2025-09-18 05:14:12'),(10,1,1,'REHAB','Rehabilitation Leave',180.00,0,0.00,1,1,0,1,'2025-09-18 05:14:59','2025-09-18 05:14:59'),(11,1,1,'SLW','Special Leave Benefits for Women',60.00,0,0.00,1,1,0,1,'2025-09-18 05:15:40','2025-09-18 05:15:40'),(12,3,1,'CALAM','Special Emergency/Calamity Leave',5.00,0,0.00,1,1,0,1,'2025-09-18 05:16:33','2025-09-18 05:16:33'),(13,1,1,'ADOPT','Adoption Leave',60.00,0,0.00,1,1,0,1,'2025-09-18 05:17:06','2025-09-18 05:17:06'),(14,4,2,'COMP','Compensatory Leave',0.00,0,1.50,1,1,0,1,'2025-09-18 05:18:49','2025-09-18 05:18:49');
/*!40000 ALTER TABLE `leave_types` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-26  1:21:25
