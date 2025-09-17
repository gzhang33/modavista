-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 17, 2025 at 05:49 PM
-- Server version: 8.4.3
-- PHP Version: 8.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dreamoda`
--

DELIMITER $$
--
-- Functions
--
CREATE DEFINER=`root`@`localhost` FUNCTION `normalize_slug` (`s` VARCHAR(255), `loc` VARCHAR(10)) RETURNS VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_general_ci DETERMINISTIC NO SQL SQL SECURITY INVOKER BEGIN
  DECLARE x VARCHAR(255);
  SET x := IFNULL(s,'');
  SET x := REPLACE(x,' ',' ');
  SET x := REPLACE(x,'‑','-');
  SET x := REPLACE(x,'—','-');
  SET x := REPLACE(x,'–','-');
  SET x := REPLACE(x,'/','-');
  IF loc IN ('en-GB','de-DE','es-ES','fr-FR','it-IT','nl-NL','pl-PL','pt-PT') THEN
    SET x := REPLACE(x,'&',' and ');
  ELSE
    SET x := REPLACE(x,'&',' ');
  END IF;
  SET x := TRIM(x);
  WHILE INSTR(x,'  ')>0 DO SET x := REPLACE(x,'  ',' '); END WHILE;
  SET x := REPLACE(x,' ','-');
  WHILE INSTR(x,'--')>0 DO SET x := REPLACE(x,'--','-'); END WHILE;
  IF loc IN ('en-GB','de-DE','es-ES','fr-FR','it-IT','nl-NL','pl-PL','pt-PT') THEN
    SET x := LOWER(x);
  END IF;
  WHILE LEFT(x,1)='-' DO SET x := SUBSTRING(x,2); END WHILE;
  WHILE RIGHT(x,1)='-' DO SET x := SUBSTRING(x,1,CHAR_LENGTH(x)-1); END WHILE;
  RETURN x;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `app_setting`
--

CREATE TABLE `app_setting` (
  `key` varchar(64) COLLATE utf8mb4_general_ci NOT NULL,
  `value` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `app_setting`
--

INSERT INTO `app_setting` (`key`, `value`, `updated_at`) VALUES
('default_admin_locale', 'zh-CN', '2025-08-24 19:31:20'),
('default_site_locale', 'en-GB', '2025-08-24 19:31:20');

-- --------------------------------------------------------

--
-- Table structure for table `app_user`
--

CREATE TABLE `app_user` (
  `id` int UNSIGNED NOT NULL,
  `company_id` int UNSIGNED DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `full_name` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `role` enum('buyer','admin') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'buyer',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_log`
--

CREATE TABLE `audit_log` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` int UNSIGNED DEFAULT NULL,
  `action` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `target_id` bigint DEFAULT NULL,
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ;

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `id` int UNSIGNED NOT NULL COMMENT '分类ID，主键，自动增长',
  `category_name_en` varchar(255) COLLATE utf8mb4_general_ci NOT NULL COMMENT '分类名称 (例如: Jackets)',
  `parent_id` int UNSIGNED DEFAULT NULL COMMENT '父分类ID，用于支持多级分类'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='产品分类表';

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`id`, `category_name_en`, `parent_id`) VALUES
(49, 'Bottoms', NULL),
(50, 'Dresses', NULL),
(48, 'Outerwear', NULL),
(47, 'Tops', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `category_i18n`
--

CREATE TABLE `category_i18n` (
  `category_id` int UNSIGNED NOT NULL,
  `locale` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `slug_norm` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `category_i18n`
--

INSERT INTO `category_i18n` (`category_id`, `locale`, `name`, `slug`, `slug_norm`) VALUES
(47, 'de-DE', 'Oberteile', 'oberteile', 'oberteile'),
(47, 'en-GB', 'Tops', 'tops', 'tops'),
(47, 'es-ES', 'Tops', 'tops', 'tops'),
(47, 'fr-FR', 'Hauts', 'hauts', 'hauts'),
(47, 'it-IT', 'Top', 'top', 'top'),
(47, 'nl-NL', 'Tops', 'tops', 'tops'),
(47, 'pl-PL', 'Góra', 'góra', 'góra'),
(47, 'pt-PT', 'Tops', 'tops', 'tops'),
(48, 'de-DE', 'Oberbekleidung', 'oberbekleidung', 'oberbekleidung'),
(48, 'en-GB', 'Outerwear', 'outerwear', 'outerwear'),
(48, 'es-ES', 'Ropa de abrigo', 'ropa-de-abrigo', 'ropa-de-abrigo'),
(48, 'fr-FR', 'Vêtements d\'extérieur', 'vêtements-d\'extérieur', 'vêtements-d\'extérieur'),
(48, 'it-IT', 'Capispalla', 'capispalla', 'capispalla'),
(48, 'nl-NL', 'Buitenkleding', 'buitenkleding', 'buitenkleding'),
(48, 'pl-PL', 'Odzież wierzchnia', 'odzież-wierzchnia', 'odzież-wierzchnia'),
(48, 'pt-PT', 'Roupa exterior', 'roupa-exterior', 'roupa-exterior'),
(49, 'de-DE', 'Unterteile', 'unterteile', 'unterteile'),
(49, 'en-GB', 'Bottoms', 'bottoms', 'bottoms'),
(49, 'es-ES', 'Pantalones', 'pantalones', 'pantalones'),
(49, 'fr-FR', 'Bas', 'bas', 'bas'),
(49, 'it-IT', 'Pantaloni', 'pantaloni', 'pantaloni'),
(49, 'nl-NL', 'Onderkant', 'onderkant', 'onderkant'),
(49, 'pl-PL', 'Spodnie', 'spodnie', 'spodnie'),
(49, 'pt-PT', 'Calças', 'calças', 'calças'),
(50, 'de-DE', 'Kleider', 'kleider', 'kleider'),
(50, 'en-GB', 'Dresses', 'dresses', 'dresses'),
(50, 'es-ES', 'Vestidos', 'vestidos', 'vestidos'),
(50, 'fr-FR', 'Robes', 'robes', 'robes'),
(50, 'it-IT', 'Abiti', 'abiti', 'abiti'),
(50, 'nl-NL', 'Jurken', 'jurken', 'jurken'),
(50, 'pl-PL', 'Sukienki', 'sukienki', 'sukienki'),
(50, 'pt-PT', 'Vestidos', 'vestidos', 'vestidos');

--
-- Triggers `category_i18n`
--
DELIMITER $$
CREATE TRIGGER `trg_cat_i18n_norm_bi` BEFORE INSERT ON `category_i18n` FOR EACH ROW BEGIN
  SET NEW.slug := normalize_slug(COALESCE(NULLIF(NEW.slug,''), NEW.name), NEW.locale);
  SET NEW.slug_norm := NEW.slug;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_cat_i18n_norm_bu` BEFORE UPDATE ON `category_i18n` FOR EACH ROW BEGIN
  IF NEW.slug <> OLD.slug OR NEW.name <> OLD.name OR NEW.locale <> OLD.locale THEN
    SET NEW.slug := normalize_slug(COALESCE(NULLIF(NEW.slug,''), NEW.name), NEW.locale);
  END IF;
  SET NEW.slug_norm := NEW.slug;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `color`
--

CREATE TABLE `color` (
  `id` int UNSIGNED NOT NULL,
  `color_name` varchar(100) DEFAULT NULL,
  `color_code` varchar(7) DEFAULT NULL COMMENT '颜色的HEX代码 (例如: #FF0000)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `color`
--

INSERT INTO `color` (`id`, `color_name`, `color_code`) VALUES
(1, 'Green', '#008000'),
(2, 'White', '#FFFFFF'),
(4, 'Black', '#000000'),
(5, 'Grey', '#808080'),
(6, 'Charcoal', '#36454F'),
(7, 'Beige', '#F5F5DC'),
(8, 'Cream', '#FFFDD0'),
(9, 'Ivory', '#FFFFF0'),
(10, 'Khaki', '#C3B091'),
(11, 'Brown', '#964B00'),
(12, 'Tan', '#D2B48C'),
(13, 'Navy', '#000080'),
(14, 'Royal Blue', '#4169E1'),
(15, 'Light Blue', '#ADD8E6'),
(16, 'Teal', '#008080'),
(17, 'Denim', '#1560BD'),
(18, 'Red', '#FF0000'),
(19, 'Burgundy', '#800020'),
(20, 'Maroon', '#800000'),
(21, 'Pink', '#FFC0CB'),
(22, 'Fuchsia', '#FF00FF'),
(23, 'Olive', '#808000'),
(24, 'Mint Green', '#98FF98'),
(25, 'Sage Green', '#B2AC88'),
(26, 'Emerald', '#50C878'),
(27, 'Yellow', '#FFFF00'),
(28, 'Mustard', '#FFDB58'),
(29, 'Gold', '#FFD700'),
(30, 'Orange', '#FFA500'),
(31, 'Coral', '#FF7F50'),
(32, 'Purple', '#800080'),
(33, 'Lavender', '#E6E6FA'),
(34, 'Violet', '#8F00FF'),
(35, 'Plum', '#DDA0DD'),
(36, 'Blue', '#0000FF');

--
-- Triggers `color`
--
DELIMITER $$
CREATE TRIGGER `colors_hex_bi` BEFORE INSERT ON `color` FOR EACH ROW BEGIN
  SET NEW.color_code = REPLACE(NEW.color_code,'＃','#');
  SET NEW.color_code = UPPER(NEW.color_code);
  IF NEW.color_code NOT REGEXP '^#[0-9A-F]{6}$' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='color_code must be #RRGGBB';
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `colors_hex_bu` BEFORE UPDATE ON `color` FOR EACH ROW BEGIN
  SET NEW.color_code = REPLACE(NEW.color_code,'＃','#');
  SET NEW.color_code = UPPER(NEW.color_code);
  IF NEW.color_code NOT REGEXP '^#[0-9A-F]{6}$' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='color_code must be #RRGGBB';
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `color_i18n`
--

CREATE TABLE `color_i18n` (
  `color_id` int UNSIGNED NOT NULL,
  `locale` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `color_i18n`
--

INSERT INTO `color_i18n` (`color_id`, `locale`, `name`) VALUES
(1, 'en-GB', 'Green'),
(1, 'it-IT', 'Verde'),
(2, 'de-DE', 'Weiß'),
(2, 'en-GB', 'White'),
(2, 'es-ES', 'Blanco'),
(2, 'fr-FR', 'Blanc'),
(2, 'it-IT', 'Bianco'),
(2, 'nl-NL', 'Wit'),
(2, 'pl-PL', 'Biały'),
(2, 'pt-PT', 'Branco'),
(4, 'de-DE', 'Schwarz'),
(4, 'en-GB', 'Black'),
(4, 'es-ES', 'Negro'),
(4, 'fr-FR', 'Noir'),
(4, 'it-IT', 'Nero'),
(4, 'nl-NL', 'Zwart'),
(4, 'pl-PL', 'Czarny'),
(4, 'pt-PT', 'Preto'),
(5, 'en-GB', 'Grey'),
(5, 'it-IT', 'Grigio'),
(6, 'en-GB', 'Charcoal'),
(6, 'it-IT', 'Carbone'),
(7, 'en-GB', 'Beige'),
(7, 'it-IT', 'Beige'),
(8, 'en-GB', 'Cream'),
(8, 'it-IT', 'Crema'),
(9, 'en-GB', 'Ivory'),
(9, 'it-IT', 'Avorio'),
(10, 'en-GB', 'Khaki'),
(10, 'it-IT', 'Khaki'),
(11, 'en-GB', 'Brown'),
(11, 'it-IT', 'Marrone'),
(12, 'en-GB', 'Tan'),
(12, 'it-IT', 'Abbronzato'),
(13, 'en-GB', 'Navy'),
(13, 'it-IT', 'Blu Navy'),
(14, 'en-GB', 'Royal Blue'),
(14, 'it-IT', 'Blu Reale'),
(15, 'en-GB', 'Light Blue'),
(15, 'it-IT', 'Azzurro'),
(16, 'en-GB', 'Teal'),
(16, 'it-IT', 'Verde Petrolio'),
(17, 'en-GB', 'Denim'),
(17, 'it-IT', 'Denim'),
(18, 'en-GB', 'Red'),
(18, 'it-IT', 'Rosso'),
(19, 'en-GB', 'Burgundy'),
(19, 'it-IT', 'Borgogna'),
(20, 'en-GB', 'Maroon'),
(20, 'it-IT', 'Marrone Scuro'),
(21, 'en-GB', 'Pink'),
(21, 'it-IT', 'Rosa'),
(22, 'en-GB', 'Fuchsia'),
(22, 'it-IT', 'Fucsia'),
(23, 'en-GB', 'Olive'),
(23, 'it-IT', 'Oliva'),
(24, 'en-GB', 'Mint Green'),
(24, 'it-IT', 'Verde Menta'),
(25, 'en-GB', 'Sage Green'),
(25, 'it-IT', 'Verde Salvia'),
(26, 'en-GB', 'Emerald'),
(26, 'it-IT', 'Smeraldo'),
(27, 'de-DE', 'Gelb'),
(27, 'en-GB', 'Yellow'),
(27, 'es-ES', 'Amarillo'),
(27, 'fr-FR', 'Jaune'),
(27, 'it-IT', 'Giallo'),
(27, 'nl-NL', 'Geel'),
(27, 'pl-PL', 'Żółty'),
(27, 'pt-PT', 'Amarelo'),
(28, 'de-DE', 'Senfgelb'),
(28, 'en-GB', 'Mustard'),
(28, 'es-ES', 'Mostaza'),
(28, 'fr-FR', 'Moutarde'),
(28, 'it-IT', 'Senape'),
(28, 'nl-NL', 'Mosterd'),
(28, 'pl-PL', 'Musztardowy'),
(28, 'pt-PT', 'Mostarda'),
(29, 'de-DE', 'Gold'),
(29, 'en-GB', 'Gold'),
(29, 'es-ES', 'Oro'),
(29, 'fr-FR', 'Or'),
(29, 'it-IT', 'Oro'),
(29, 'nl-NL', 'Goud'),
(29, 'pl-PL', 'Złoty'),
(29, 'pt-PT', 'Dourado'),
(30, 'de-DE', 'Orange'),
(30, 'en-GB', 'Orange'),
(30, 'es-ES', 'Naranja'),
(30, 'fr-FR', 'Orange'),
(30, 'it-IT', 'Arancione'),
(30, 'nl-NL', 'Oranje'),
(30, 'pl-PL', 'Pomarańczowy'),
(30, 'pt-PT', 'Laranja'),
(31, 'de-DE', 'Koralle'),
(31, 'en-GB', 'Coral'),
(31, 'es-ES', 'Coral'),
(31, 'fr-FR', 'Corail'),
(31, 'it-IT', 'Corallo'),
(31, 'nl-NL', 'Koraal'),
(31, 'pl-PL', 'Koralowy'),
(31, 'pt-PT', 'Coral'),
(32, 'de-DE', 'Violett'),
(32, 'en-GB', 'Purple'),
(32, 'es-ES', 'Morado'),
(32, 'fr-FR', 'Violet'),
(32, 'it-IT', 'Viola'),
(32, 'nl-NL', 'Paars'),
(32, 'pl-PL', 'Fioletowy'),
(32, 'pt-PT', 'Roxo'),
(33, 'de-DE', 'Lavendel'),
(33, 'en-GB', 'Lavender'),
(33, 'es-ES', 'Lavanda'),
(33, 'fr-FR', 'Lavande'),
(33, 'it-IT', 'Lavanda'),
(33, 'nl-NL', 'Lavendel'),
(33, 'pl-PL', 'Lawendowy'),
(33, 'pt-PT', 'Lavanda'),
(34, 'de-DE', 'Violett'),
(34, 'en-GB', 'Violet'),
(34, 'es-ES', 'Violeta'),
(34, 'fr-FR', 'Violet'),
(34, 'it-IT', 'Viola'),
(34, 'nl-NL', 'Violet'),
(34, 'pl-PL', 'Fiolet'),
(34, 'pt-PT', 'Violeta'),
(35, 'de-DE', 'Pflaume'),
(35, 'en-GB', 'Plum'),
(35, 'es-ES', 'Ciruela'),
(35, 'fr-FR', 'Prune'),
(35, 'it-IT', 'Prugna'),
(35, 'nl-NL', 'Pruim'),
(35, 'pl-PL', 'Śliwkowy'),
(35, 'pt-PT', 'Ameixa'),
(36, 'de-DE', 'Blau'),
(36, 'en-GB', 'Blue'),
(36, 'es-ES', 'Azul'),
(36, 'fr-FR', 'Bleu'),
(36, 'it-IT', 'Blu'),
(36, 'nl-NL', 'Blauw'),
(36, 'pl-PL', 'Niebieski'),
(36, 'pt-PT', 'Azul');

-- --------------------------------------------------------

--
-- Table structure for table `company`
--

CREATE TABLE `company` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `country_code` char(2) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `vat_no` varchar(64) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `company` varchar(100) DEFAULT NULL,
  `business_type` varchar(50) DEFAULT 'retail',
  `message` text NOT NULL,
  `inquiry_type` enum('general','sample','catalog') DEFAULT 'general',
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_processed` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已处理',
  `processed_at` datetime DEFAULT NULL COMMENT '处理时间',
  `todo_status` enum('待定','进行中','完成') NOT NULL DEFAULT '待定' COMMENT '待办状态',
  `todo_notes` text COMMENT '待办备注'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `contact_messages`
--

INSERT INTO `contact_messages` (`id`, `name`, `email`, `phone`, `company`, `business_type`, `message`, `inquiry_type`, `ip_address`, `created_at`, `is_processed`, `processed_at`, `todo_status`, `todo_notes`) VALUES
(18, 'Test User', 'test@example.com', NULL, '', 'retail', 'Test message', 'general', '::1', '2025-09-14 19:00:20', 0, NULL, '待定', NULL),
(19, 'gianni zhang', 'gmail@gmail.com', NULL, '', 'retail', 'dasdasdw we asa dw asd w', 'general', '::1', '2025-09-14 19:00:45', 0, NULL, '待定', NULL),
(20, 'Test User', 'test@example.com', NULL, '', 'retail', 'Test message for feedback mechanism', 'general', '::1', '2025-09-14 19:03:56', 0, NULL, '待定', NULL),
(21, 'John Doe', 'john.doe@example.com', NULL, '', 'retail', 'Testing English feedback mechanism', 'general', '::1', '2025-09-14 19:04:37', 0, NULL, '待定', NULL),
(22, 'Gianni Zhang', 'gzhang1819298200@gmail.com', NULL, '', 'retail', 'ewqeasdwq weq dsa d w ', 'general', '::1', '2025-09-14 19:05:12', 0, NULL, '待定', ''),
(23, 'Sample Request', 'customer491ukc@example.com', '', 'Sample Request Company', 'retail', 'Sample Request - Product: {productName} (SKU: {productSku})\n\nCustomer wishes to request a sample of this product to evaluate quality and suitability. Please contact the customer to arrange sample shipping.\n\nProduct Details:\n- Product Name: {productName}\n- SKU: {productSku}\n- Category: {productCategory}\n- Material: {productMaterial}\n\nPlease process this sample request as soon as possible.', 'general', '::1', '2025-09-15 21:56:05', 0, NULL, '待定', '正在联系客户'),
(24, 'Sample Request', 'customeruj0xz8@example.com', '', 'Sample Request Company', 'retail', 'Sample Request - Product: {productName} (SKU: {productSku})\n\nCustomer wishes to request a sample of this product to evaluate quality and suitability. Please contact the customer to arrange sample shipping.\n\nProduct Details:\n- Product Name: {productName}\n- SKU: {productSku}\n- Category: {productCategory}\n- Material: {productMaterial}\n\nPlease process this sample request as soon as possible.', 'general', '::1', '2025-09-16 22:25:32', 0, NULL, '待定', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `locales`
--

CREATE TABLE `locales` (
  `code` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `language_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sort_order` tinyint UNSIGNED NOT NULL DEFAULT '99'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `locales`
--

INSERT INTO `locales` (`code`, `language_name`, `sort_order`) VALUES
('de-DE', 'German', 5),
('en-GB', 'English', 1),
('es-ES', 'Spanish', 6),
('fr-FR', 'French', 4),
('it-IT', 'Italian', 3),
('nl-NL', 'Dutch', 7),
('pl-PL', 'Polish', 8),
('pt-PT', 'Portuguese', 9);

-- --------------------------------------------------------

--
-- Table structure for table `material`
--

CREATE TABLE `material` (
  `id` int UNSIGNED NOT NULL,
  `material_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='产品材质表';

--
-- Dumping data for table `material`
--

INSERT INTO `material` (`id`, `material_name`) VALUES
(18, 'Acrylic'),
(1, 'Cotton'),
(17, 'Elastane'),
(22, 'Leather'),
(8, 'Linen'),
(20, 'Lyocell (TENCEL)'),
(19, 'Modal'),
(16, 'Polyamide'),
(4, 'Polyester'),
(3, 'Silk'),
(13, 'Viscose'),
(2, 'Wool');

-- --------------------------------------------------------

--
-- Table structure for table `material_i18n`
--

CREATE TABLE `material_i18n` (
  `material_id` int UNSIGNED NOT NULL,
  `locale` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `material_i18n`
--

INSERT INTO `material_i18n` (`material_id`, `locale`, `name`) VALUES
(1, 'de-DE', 'Baumwolle'),
(1, 'en-GB', 'Cotton'),
(1, 'es-ES', 'Algodón'),
(1, 'fr-FR', 'Coton'),
(1, 'it-IT', 'Cotone'),
(1, 'nl-NL', 'Katoen'),
(1, 'pl-PL', 'Bawełna'),
(1, 'pt-PT', 'Algodão'),
(2, 'de-DE', 'Wolle'),
(2, 'en-GB', 'Wool'),
(2, 'es-ES', 'Lana'),
(2, 'fr-FR', 'Laine'),
(2, 'it-IT', 'Lana'),
(2, 'nl-NL', 'Wol'),
(2, 'pl-PL', 'Wełna'),
(2, 'pt-PT', 'Lã'),
(3, 'de-DE', 'Seide'),
(3, 'en-GB', 'Silk'),
(3, 'es-ES', 'Seda'),
(3, 'fr-FR', 'Soie'),
(3, 'it-IT', 'Seta'),
(3, 'nl-NL', 'Zijde'),
(3, 'pl-PL', 'Jedwab'),
(3, 'pt-PT', 'Seda'),
(4, 'de-DE', 'Polyester'),
(4, 'en-GB', 'Polyester'),
(4, 'es-ES', 'Poliéster'),
(4, 'fr-FR', 'Polyester'),
(4, 'it-IT', 'Poliestere'),
(4, 'nl-NL', 'Polyester'),
(4, 'pl-PL', 'Poliester'),
(4, 'pt-PT', 'Poliéster'),
(8, 'de-DE', 'Leinen'),
(8, 'en-GB', 'Linen'),
(8, 'es-ES', 'Lino'),
(8, 'fr-FR', 'Lin'),
(8, 'it-IT', 'Lino'),
(8, 'nl-NL', 'Linnen'),
(8, 'pl-PL', 'Len'),
(8, 'pt-PT', 'Linho'),
(13, 'en-GB', 'Viscose'),
(13, 'it-IT', 'Viscosa'),
(16, 'en-GB', 'Polyamide'),
(16, 'it-IT', 'Poliammide'),
(17, 'en-GB', 'Elastane'),
(17, 'it-IT', 'Elastan'),
(18, 'en-GB', 'Acrylic'),
(18, 'it-IT', 'Acrilico'),
(19, 'en-GB', 'Modal'),
(19, 'it-IT', 'Modal'),
(20, 'en-GB', 'Lyocell (TENCEL)'),
(20, 'it-IT', 'Lyocell (TENCEL)'),
(22, 'en-GB', 'Leather'),
(22, 'it-IT', 'Pelle');

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `id` int UNSIGNED NOT NULL COMMENT '产品ID，主键，自动增长',
  `base_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL COMMENT '产品基础名称 (例如: Blazer)',
  `description` text COLLATE utf8mb4_general_ci COMMENT '产品描述',
  `category_id` int UNSIGNED DEFAULT NULL COMMENT '外键，关联 categories 表',
  `material_id` int UNSIGNED DEFAULT NULL,
  `season_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `status` enum('draft','review','published','archived') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'published'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='产品主表';

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`id`, `base_name`, `description`, `category_id`, `material_id`, `season_id`, `created_at`, `updated_at`, `status`) VALUES
(48, '测试产品1', '这个是测试产品1', 48, 17, 1, '2025-09-15 21:20:28', NULL, 'published'),
(49, '测试产品2', 'This is Test Product 2.', 49, 17, 2, '2025-09-15 21:49:35', '2025-09-15 22:48:17', 'published');

-- --------------------------------------------------------

--
-- Table structure for table `product_i18n`
--

CREATE TABLE `product_i18n` (
  `product_id` int UNSIGNED NOT NULL,
  `locale` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `slug` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `status` enum('draft','review','published') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'published',
  `translation_timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_i18n`
--

INSERT INTO `product_i18n` (`product_id`, `locale`, `name`, `description`, `slug`, `status`, `translation_timestamp`) VALUES
(48, 'de-DE', 'Testprodukt 1', 'Dies ist das Testprodukt 1.', 'testprodukt-1', 'published', '2025-09-15 20:20:28'),
(48, 'en-GB', 'Test Product 1', 'This is Test Product 1.', 'test-product-1', 'published', '2025-09-15 20:20:28'),
(48, 'es-ES', 'Producto de prueba 1', 'Este es el producto de prueba 1.', 'producto-de-prueba-1', 'published', '2025-09-15 20:20:28'),
(48, 'fr-FR', 'Produit de test 1', 'Ceci est un produit de test 1.', 'produit-de-test-1', 'published', '2025-09-15 20:20:28'),
(48, 'it-IT', 'Prodotto di Test 1', 'Questo è il prodotto di prova 1.', 'prodotto-di-test-1', 'published', '2025-09-15 20:20:28'),
(49, 'de-DE', 'Testprodukt 2', 'Dies ist das Testprodukt 2.', 'testprodukt-2', 'published', '2025-09-16 18:58:00'),
(49, 'en-GB', 'Test Product 2', 'This is Test Product 2.', 'test-product-2', 'published', '2025-09-16 18:58:00'),
(49, 'es-ES', 'Producto de Prueba 2', 'Este es el producto de prueba 2.', 'producto-de-prueba-2', 'published', '2025-09-16 18:58:00'),
(49, 'fr-FR', 'Produit de Test 2', 'Ceci est le produit de test 2.', 'produit-de-test-2', 'published', '2025-09-16 18:58:00'),
(49, 'it-IT', 'Prodotto di Test 2', 'Questo è il prodotto di prova 2.', 'prodotto-di-test-2', 'published', '2025-09-16 18:58:00');

--
-- Triggers `product_i18n`
--
DELIMITER $$
CREATE TRIGGER `trg_prod_i18n_slug_bi` BEFORE INSERT ON `product_i18n` FOR EACH ROW BEGIN
  SET NEW.slug := normalize_slug(COALESCE(NULLIF(NEW.slug,''), NEW.name), NEW.locale);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_prod_i18n_slug_bu` BEFORE UPDATE ON `product_i18n` FOR EACH ROW BEGIN
  IF NEW.slug <> OLD.slug OR NEW.name <> OLD.name OR NEW.locale <> OLD.locale THEN
    SET NEW.slug := normalize_slug(COALESCE(NULLIF(NEW.slug,''), NEW.name), NEW.locale);
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `product_media`
--

CREATE TABLE `product_media` (
  `id` int UNSIGNED NOT NULL COMMENT '媒体ID，自增主键',
  `variant_id` int UNSIGNED NOT NULL COMMENT '外键，关联 product_variants 表',
  `image_path` varchar(255) COLLATE utf8mb4_general_ci NOT NULL COMMENT '图片路径',
  `sort_order` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='产品媒体表';

--
-- Dumping data for table `product_media`
--

INSERT INTO `product_media` (`id`, `variant_id`, `image_path`, `sort_order`) VALUES
(72, 61, 'products/media-68c8750c776c8-7b524a4f.jpg', 0),
(73, 62, 'products/media-68c8750c783e1-56e808dc.jpg', 0),
(74, 63, 'products/media-68c87bdfda361-3aefc820.jpg', 0),
(81, 64, 'products/media-68c87bdfde03e-a84cb6b2.jpg', 0),
(82, 64, 'products/media-68c87bdfde6e3-1ceebdc8.jpg', 1),
(83, 64, 'products/media-68c87bdfdf0b1-35bd396e.jpg', 2),
(84, 64, 'products/media-68c87bdfdf795-8eb4143b.jpg', 3);

--
-- Triggers `product_media`
--
DELIMITER $$
CREATE TRIGGER `trg_media_sort_bi` BEFORE INSERT ON `product_media` FOR EACH ROW BEGIN
  IF NEW.sort_order IS NULL THEN
    SELECT COALESCE(MAX(pm.sort_order)+1, 0)
      INTO @n
      FROM product_media pm
     WHERE pm.variant_id = NEW.variant_id;
    SET NEW.sort_order = @n;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `product_tag`
--

CREATE TABLE `product_tag` (
  `product_id` int UNSIGNED NOT NULL,
  `tag_id` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='产品与标签的关联表';

-- --------------------------------------------------------

--
-- Table structure for table `product_variant`
--

CREATE TABLE `product_variant` (
  `id` int UNSIGNED NOT NULL COMMENT '变体ID，主键，自动增长',
  `product_id` int UNSIGNED NOT NULL COMMENT '外键，关联 products 表',
  `color_id` int UNSIGNED DEFAULT NULL COMMENT '关联到颜色表的ID',
  `sku` varchar(64) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `default_image` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '变体默认图片路径',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='产品变体表';

--
-- Dumping data for table `product_variant`
--

INSERT INTO `product_variant` (`id`, `product_id`, `color_id`, `sku`, `default_image`, `created_at`) VALUES
(61, 48, 15, NULL, 'products/media-68c8750c776c8-7b524a4f.jpg', '2025-09-15 21:20:28'),
(62, 48, 6, NULL, 'products/media-68c8750c783e1-56e808dc.jpg', '2025-09-15 21:20:28'),
(63, 49, 7, NULL, 'products/media-68c87bdfda361-3aefc820.jpg', '2025-09-15 21:49:35'),
(64, 49, 27, NULL, 'products/media-68c87bdfde03e-a84cb6b2.jpg', '2025-09-15 21:49:35');

-- --------------------------------------------------------

--
-- Table structure for table `seasons`
--

CREATE TABLE `seasons` (
  `id` int NOT NULL,
  `season_name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `seasons`
--

INSERT INTO `seasons` (`id`, `season_name`, `created_at`, `updated_at`) VALUES
(1, 'Spring/Summer', '2025-09-09 00:44:41', '2025-09-09 00:44:41'),
(2, 'Fall/Winter', '2025-09-09 00:44:41', '2025-09-09 00:44:41'),
(3, 'All Season', '2025-09-09 00:44:41', '2025-09-09 00:44:41');

-- --------------------------------------------------------

--
-- Table structure for table `seasons_i18n`
--

CREATE TABLE `seasons_i18n` (
  `id` int UNSIGNED NOT NULL,
  `season_id` int NOT NULL,
  `locale` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `seasons_i18n`
--

INSERT INTO `seasons_i18n` (`id`, `season_id`, `locale`, `name`, `created_at`, `updated_at`) VALUES
(31, 1, 'en-GB', 'Spring/Summer', '2025-09-10 01:29:29', '2025-09-10 01:29:29'),
(32, 1, 'fr-FR', 'Printemps/Été', '2025-09-10 01:29:29', '2025-09-10 01:29:29'),
(33, 1, 'de-DE', 'Frühling/Sommer', '2025-09-10 01:29:29', '2025-09-10 01:29:29'),
(34, 1, 'es-ES', 'Primavera/Verano', '2025-09-10 01:29:29', '2025-09-10 01:29:29'),
(35, 1, 'it-IT', 'Primavera/Estate', '2025-09-10 01:29:29', '2025-09-10 01:29:29'),
(36, 2, 'en-GB', 'Fall/Winter', '2025-09-10 01:29:29', '2025-09-10 01:29:29'),
(37, 2, 'fr-FR', 'Automne/Hiver', '2025-09-10 01:29:29', '2025-09-10 01:29:29'),
(38, 2, 'de-DE', 'Herbst/Winter', '2025-09-10 01:29:29', '2025-09-10 01:29:29'),
(39, 2, 'es-ES', 'Otoño/Invierno', '2025-09-10 01:29:29', '2025-09-10 01:29:29'),
(40, 2, 'it-IT', 'Autunno/Inverno', '2025-09-10 01:29:29', '2025-09-10 01:29:29'),
(41, 3, 'en-GB', 'All Season', '2025-09-10 01:29:29', '2025-09-10 01:29:29'),
(42, 3, 'fr-FR', 'Toutes les saisons', '2025-09-10 01:29:29', '2025-09-10 01:29:29'),
(43, 3, 'de-DE', 'Alle Jahreszeiten', '2025-09-10 01:29:29', '2025-09-10 01:29:29'),
(44, 3, 'es-ES', 'Todas las estaciones', '2025-09-10 01:29:29', '2025-09-10 01:29:29'),
(45, 3, 'it-IT', 'Tutte le stagioni', '2025-09-10 01:29:29', '2025-09-10 01:29:29');

-- --------------------------------------------------------

--
-- Table structure for table `site_content`
--

CREATE TABLE `site_content` (
  `id` int UNSIGNED NOT NULL,
  `content_key` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT '内容键名',
  `content_type` enum('text','html','meta') COLLATE utf8mb4_general_ci DEFAULT 'text' COMMENT '内容类型',
  `page_section` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '页面区域',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='网站内容表';

--
-- Dumping data for table `site_content`
--

INSERT INTO `site_content` (`id`, `content_key`, `content_type`, `page_section`, `created_at`, `updated_at`) VALUES
(1, 'site_title', 'text', 'header', '2025-08-23 22:41:49', NULL),
(2, 'site_description', 'meta', 'meta', '2025-08-23 22:41:49', NULL),
(3, 'nav_home', 'text', 'navigation', '2025-08-23 22:41:49', NULL),
(4, 'nav_products', 'text', 'navigation', '2025-08-23 22:41:49', NULL),
(5, 'nav_about', 'text', 'navigation', '2025-08-23 22:41:49', NULL),
(6, 'nav_contact', 'text', 'navigation', '2025-08-23 22:41:49', NULL),
(7, 'hero_title', 'text', 'hero', '2025-08-23 22:41:49', NULL),
(8, 'hero_subtitle', 'text', 'hero', '2025-08-23 22:41:49', NULL),
(9, 'cta_button', 'text', 'hero', '2025-08-23 22:41:49', NULL),
(10, 'footer_copyright', 'text', 'footer', '2025-08-23 22:41:49', NULL),
(11, 'footer_company_info', 'text', 'footer', '2025-08-23 22:41:49', NULL),
(12, 'filter_all_categories', 'text', 'filters', '2025-08-23 22:41:49', NULL),
(13, 'sort_featured', 'text', 'filters', '2025-08-23 22:41:49', NULL),
(14, 'sort_newest', 'text', 'filters', '2025-08-23 22:41:49', NULL),
(15, 'reset_filters', 'text', 'filters', '2025-08-23 22:41:49', NULL),
(16, 'contact_description', 'text', 'contact', '2025-08-23 22:41:49', NULL),
(17, 'contact_title', 'text', NULL, '2025-08-25 17:32:15', NULL),
(18, 'footer_shop', 'text', NULL, '2025-08-25 17:32:15', NULL),
(19, 'footer_collection', 'text', NULL, '2025-08-25 17:32:15', NULL),
(20, 'footer_support', 'text', NULL, '2025-08-25 17:32:15', NULL),
(21, 'footer_contact', 'text', NULL, '2025-08-25 17:32:15', NULL),
(22, 'breadcrumb_home', 'text', NULL, '2025-08-25 17:32:15', NULL),
(23, 'breadcrumb_collection', 'text', NULL, '2025-08-25 17:32:15', NULL),
(24, 'contact_form_name', 'text', NULL, '2025-08-25 17:32:15', NULL),
(25, 'contact_form_email', 'text', NULL, '2025-08-25 17:32:15', NULL),
(26, 'contact_form_phone', 'text', NULL, '2025-08-25 17:32:15', NULL),
(27, 'contact_form_company', 'text', NULL, '2025-08-25 17:32:15', NULL),
(28, 'contact_form_message', 'text', NULL, '2025-08-25 17:32:15', NULL),
(29, 'contact_form_send', 'text', NULL, '2025-08-25 17:32:15', NULL),
(30, 'contact_form_cancel', 'text', NULL, '2025-08-25 17:32:15', NULL),
(31, 'contact_form_success', 'text', NULL, '2025-08-25 17:32:15', NULL),
(32, 'contact_form_error', 'text', NULL, '2025-08-25 17:32:15', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `site_content_translation`
--

CREATE TABLE `site_content_translation` (
  `id` int UNSIGNED NOT NULL,
  `content_id` int UNSIGNED NOT NULL,
  `language_code` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `translated_text` text COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='网站内容翻译表';

--
-- Dumping data for table `site_content_translation`
--

INSERT INTO `site_content_translation` (`id`, `content_id`, `language_code`, `translated_text`, `created_at`, `updated_at`) VALUES
(1, 1, 'en-GB', 'Fashion Collection', '2025-08-23 22:41:49', '2025-08-24 04:59:17'),
(2, 2, 'en-GB', 'Discover our exclusive fashion collection with premium quality materials', '2025-08-23 22:41:49', '2025-08-24 04:59:17'),
(3, 3, 'en-GB', 'Home', '2025-08-23 22:41:49', '2025-08-24 04:59:17'),
(4, 4, 'en-GB', 'All Products', '2025-08-23 22:41:49', '2025-08-25 17:33:42'),
(5, 5, 'en-GB', 'About', '2025-08-23 22:41:49', '2025-08-24 04:59:17'),
(6, 6, 'en-GB', 'Contact', '2025-08-23 22:41:49', '2025-08-24 04:59:17'),
(7, 7, 'en-GB', 'Discover Your Style', '2025-08-23 22:41:49', '2025-08-24 04:59:17'),
(8, 8, 'en-GB', 'Premium fashion for the modern lifestyle', '2025-08-23 22:41:49', '2025-08-24 04:59:17'),
(9, 9, 'en-GB', 'Shop Now', '2025-08-23 22:41:49', '2025-08-24 04:59:17'),
(10, 10, 'en-GB', '© 2025 Fashion Collection. All rights reserved.', '2025-08-23 22:41:49', '2025-08-24 04:59:17'),
(11, 11, 'en-GB', 'Premium fashion brand offering quality clothing and accessories', '2025-08-23 22:41:49', '2025-08-24 04:59:17'),
(12, 12, 'en-GB', 'All Categories', '2025-08-23 22:41:49', '2025-08-24 04:59:17'),
(13, 13, 'en-GB', 'Featured', '2025-08-23 22:41:49', '2025-08-24 04:59:17'),
(14, 14, 'en-GB', 'Newest', '2025-08-23 22:41:49', '2025-08-24 04:59:17'),
(15, 15, 'en-GB', 'Reset', '2025-08-23 22:41:49', '2025-08-24 04:59:17'),
(16, 16, 'en-GB', 'If you have questions or collaboration proposals, we would be happy to hear from you.', '2025-08-23 22:41:49', '2025-08-24 04:59:17'),
(17, 23, 'it-IT', 'Collezione', '2025-08-25 17:33:42', NULL),
(18, 22, 'it-IT', 'Home', '2025-08-25 17:33:42', NULL),
(19, 16, 'it-IT', 'Se hai domande o proposte di collaborazione, saremo felici di sentirti.', '2025-08-25 17:33:42', NULL),
(20, 30, 'it-IT', 'Annulla', '2025-08-25 17:33:42', NULL),
(21, 27, 'it-IT', 'Azienda', '2025-08-25 17:33:42', NULL),
(22, 25, 'it-IT', 'Email', '2025-08-25 17:33:42', NULL),
(23, 32, 'it-IT', 'Errore durante l\'invio del messaggio. Riprova più tardi.', '2025-08-25 17:33:42', NULL),
(24, 28, 'it-IT', 'Messaggio', '2025-08-25 17:33:42', NULL),
(25, 24, 'it-IT', 'Nome', '2025-08-25 17:33:42', NULL),
(26, 26, 'it-IT', 'Telefono', '2025-08-25 17:33:42', NULL),
(27, 29, 'it-IT', 'Invia Messaggio', '2025-08-25 17:33:42', NULL),
(28, 31, 'it-IT', 'Messaggio inviato con successo! Ti risponderemo presto.', '2025-08-25 17:33:42', NULL),
(29, 17, 'it-IT', 'Contattaci', '2025-08-25 17:33:42', NULL),
(30, 19, 'it-IT', 'Collezione', '2025-08-25 17:33:42', NULL),
(31, 21, 'it-IT', 'Contattaci', '2025-08-25 17:33:42', NULL),
(32, 18, 'it-IT', 'Negozio', '2025-08-25 17:33:42', NULL),
(33, 20, 'it-IT', 'Assistenza Clienti', '2025-08-25 17:33:42', NULL),
(34, 6, 'it-IT', 'Contatti', '2025-08-25 17:33:42', NULL),
(35, 4, 'it-IT', 'Tutti i Prodotti', '2025-08-25 17:33:42', NULL),
(36, 2, 'it-IT', 'Scopri la nostra collezione esclusiva di moda', '2025-08-25 17:33:42', NULL),
(37, 1, 'it-IT', 'Collezione Moda', '2025-08-25 17:33:42', NULL),
(48, 23, 'en-GB', 'Collection', '2025-08-25 17:33:42', NULL),
(49, 22, 'en-GB', 'Home', '2025-08-25 17:33:42', NULL),
(50, 30, 'en-GB', 'Cancel', '2025-08-25 17:33:42', NULL),
(51, 27, 'en-GB', 'Company', '2025-08-25 17:33:42', NULL),
(52, 25, 'en-GB', 'Email', '2025-08-25 17:33:42', NULL),
(53, 32, 'en-GB', 'Error sending message. Please try again later.', '2025-08-25 17:33:42', NULL),
(54, 28, 'en-GB', 'Message', '2025-08-25 17:33:42', NULL),
(55, 24, 'en-GB', 'Name', '2025-08-25 17:33:42', NULL),
(56, 26, 'en-GB', 'Phone', '2025-08-25 17:33:42', NULL),
(57, 29, 'en-GB', 'Send Message', '2025-08-25 17:33:42', NULL),
(58, 31, 'en-GB', 'Message sent successfully! We will reply soon.', '2025-08-25 17:33:42', NULL),
(59, 17, 'en-GB', 'Contact Us', '2025-08-25 17:33:42', NULL),
(60, 19, 'en-GB', 'Collection', '2025-08-25 17:33:42', NULL),
(61, 21, 'en-GB', 'Contact Us', '2025-08-25 17:33:42', NULL),
(62, 18, 'en-GB', 'Shop', '2025-08-25 17:33:42', NULL),
(63, 20, 'en-GB', 'Customer Support', '2025-08-25 17:33:42', NULL),
(79, 23, 'de-DE', 'Kollektion', '2025-08-25 17:33:42', NULL),
(80, 22, 'de-DE', 'Startseite', '2025-08-25 17:33:42', NULL),
(81, 16, 'de-DE', 'Wenn Sie Fragen oder Kooperationsvorschläge haben, freuen wir uns auf Ihre Nachricht.', '2025-08-25 17:33:42', NULL),
(82, 30, 'de-DE', 'Abbrechen', '2025-08-25 17:33:42', NULL),
(83, 27, 'de-DE', 'Unternehmen', '2025-08-25 17:33:42', NULL),
(84, 25, 'de-DE', 'E-Mail', '2025-08-25 17:33:42', NULL),
(85, 32, 'de-DE', 'Fehler beim Senden der Nachricht. Bitte versuchen Sie es später erneut.', '2025-08-25 17:33:42', NULL),
(86, 28, 'de-DE', 'Nachricht', '2025-08-25 17:33:42', NULL),
(87, 24, 'de-DE', 'Name', '2025-08-25 17:33:42', NULL),
(88, 26, 'de-DE', 'Telefon', '2025-08-25 17:33:42', NULL),
(89, 29, 'de-DE', 'Nachricht senden', '2025-08-25 17:33:42', NULL),
(90, 31, 'de-DE', 'Nachricht erfolgreich gesendet! Wir werden bald antworten.', '2025-08-25 17:33:42', NULL),
(91, 17, 'de-DE', 'Kontakt', '2025-08-25 17:33:42', NULL),
(92, 19, 'de-DE', 'Kollektion', '2025-08-25 17:33:42', NULL),
(93, 21, 'de-DE', 'Kontakt', '2025-08-25 17:33:42', NULL),
(94, 18, 'de-DE', 'Shop', '2025-08-25 17:33:42', NULL),
(95, 20, 'de-DE', 'Kundensupport', '2025-08-25 17:33:42', NULL),
(96, 6, 'de-DE', 'Kontakt', '2025-08-25 17:33:42', NULL),
(97, 4, 'de-DE', 'Alle Produkte', '2025-08-25 17:33:42', NULL),
(98, 2, 'de-DE', 'Entdecken Sie unsere exklusive Modekollektion mit hochwertigen Materialien', '2025-08-25 17:33:42', NULL),
(99, 1, 'de-DE', 'Mode Kollektion', '2025-08-25 17:33:42', NULL),
(110, 23, 'fr-FR', 'Collection', '2025-08-25 17:33:42', NULL),
(111, 22, 'fr-FR', 'Accueil', '2025-08-25 17:33:42', NULL),
(112, 16, 'fr-FR', 'Si vous avez des questions ou des propositions de collaboration, nous serions heureux de vous entendre.', '2025-08-25 17:33:42', NULL),
(113, 30, 'fr-FR', 'Annuler', '2025-08-25 17:33:42', NULL),
(114, 27, 'fr-FR', 'Entreprise', '2025-08-25 17:33:42', NULL),
(115, 25, 'fr-FR', 'Email', '2025-08-25 17:33:42', NULL),
(116, 32, 'fr-FR', 'Erreur lors de l\'envoi du message. Veuillez réessayer plus tard.', '2025-08-25 17:33:42', NULL),
(117, 28, 'fr-FR', 'Message', '2025-08-25 17:33:42', NULL),
(118, 24, 'fr-FR', 'Nom', '2025-08-25 17:33:42', NULL),
(119, 26, 'fr-FR', 'Téléphone', '2025-08-25 17:33:42', NULL),
(120, 29, 'fr-FR', 'Envoyer le Message', '2025-08-25 17:33:42', NULL),
(121, 31, 'fr-FR', 'Message envoyé avec succès! Nous répondrons bientôt.', '2025-08-25 17:33:42', NULL),
(122, 17, 'fr-FR', 'Nous Contacter', '2025-08-25 17:33:42', NULL),
(123, 19, 'fr-FR', 'Collection', '2025-08-25 17:33:42', NULL),
(124, 21, 'fr-FR', 'Nous Contacter', '2025-08-25 17:33:42', NULL),
(125, 18, 'fr-FR', 'Boutique', '2025-08-25 17:33:42', NULL),
(126, 20, 'fr-FR', 'Support Client', '2025-08-25 17:33:42', NULL),
(127, 6, 'fr-FR', 'Contact', '2025-08-25 17:33:42', NULL),
(128, 4, 'fr-FR', 'Tous les Produits', '2025-08-25 17:33:42', NULL),
(129, 2, 'fr-FR', 'Découvrez notre collection exclusive de mode avec des matériaux de qualité premium', '2025-08-25 17:33:42', NULL),
(130, 1, 'fr-FR', 'Collection Mode', '2025-08-25 17:33:42', NULL),
(141, 23, 'es-ES', 'Colección', '2025-08-25 17:33:42', NULL),
(142, 22, 'es-ES', 'Inicio', '2025-08-25 17:33:42', NULL),
(143, 16, 'es-ES', 'Si tienes preguntas o propuestas de colaboración, estaremos encantados de escucharte.', '2025-08-25 17:33:42', NULL),
(144, 30, 'es-ES', 'Cancelar', '2025-08-25 17:33:42', NULL),
(145, 27, 'es-ES', 'Empresa', '2025-08-25 17:33:42', NULL),
(146, 25, 'es-ES', 'Email', '2025-08-25 17:33:42', NULL),
(147, 32, 'es-ES', 'Error al enviar el mensaje. Inténtalo de nuevo más tarde.', '2025-08-25 17:33:42', NULL),
(148, 28, 'es-ES', 'Mensaje', '2025-08-25 17:33:42', NULL),
(149, 24, 'es-ES', 'Nombre', '2025-08-25 17:33:42', NULL),
(150, 26, 'es-ES', 'Teléfono', '2025-08-25 17:33:42', NULL),
(151, 29, 'es-ES', 'Enviar Mensaje', '2025-08-25 17:33:42', NULL),
(152, 31, 'es-ES', 'Mensaje enviado con éxito! Responderemos pronto.', '2025-08-25 17:33:42', NULL),
(153, 17, 'es-ES', 'Contáctanos', '2025-08-25 17:33:42', NULL),
(154, 19, 'es-ES', 'Colección', '2025-08-25 17:33:42', NULL),
(155, 21, 'es-ES', 'Contáctanos', '2025-08-25 17:33:42', NULL),
(156, 18, 'es-ES', 'Tienda', '2025-08-25 17:33:42', NULL),
(157, 20, 'es-ES', 'Atención al Cliente', '2025-08-25 17:33:42', NULL),
(158, 6, 'es-ES', 'Contacto', '2025-08-25 17:33:42', NULL),
(159, 4, 'es-ES', 'Todos los Productos', '2025-08-25 17:33:42', NULL),
(160, 2, 'es-ES', 'Descubre nuestra colección exclusiva de moda con materiales de calidad premium', '2025-08-25 17:33:42', NULL),
(161, 1, 'es-ES', 'Colección de Moda', '2025-08-25 17:33:42', NULL),
(172, 23, 'pt-PT', 'Coleção', '2025-08-25 17:33:42', NULL),
(173, 22, 'pt-PT', 'Início', '2025-08-25 17:33:42', NULL),
(174, 16, 'pt-PT', 'Se você tem perguntas ou propostas de colaboração, ficaremos felizes em ouvir de você.', '2025-08-25 17:33:42', NULL),
(175, 30, 'pt-PT', 'Cancelar', '2025-08-25 17:33:42', NULL),
(176, 27, 'pt-PT', 'Empresa', '2025-08-25 17:33:42', NULL),
(177, 25, 'pt-PT', 'Email', '2025-08-25 17:33:42', NULL),
(178, 32, 'pt-PT', 'Erro ao enviar mensagem. Tente novamente mais tarde.', '2025-08-25 17:33:42', NULL),
(179, 28, 'pt-PT', 'Mensagem', '2025-08-25 17:33:42', NULL),
(180, 24, 'pt-PT', 'Nome', '2025-08-25 17:33:42', NULL),
(181, 26, 'pt-PT', 'Telefone', '2025-08-25 17:33:42', NULL),
(182, 29, 'pt-PT', 'Enviar Mensagem', '2025-08-25 17:33:42', NULL),
(183, 31, 'pt-PT', 'Mensagem enviada com sucesso! Responderemos em breve.', '2025-08-25 17:33:42', NULL),
(184, 17, 'pt-PT', 'Entre em Contato', '2025-08-25 17:33:42', NULL),
(185, 19, 'pt-PT', 'Coleção', '2025-08-25 17:33:42', NULL),
(186, 21, 'pt-PT', 'Entre em Contato', '2025-08-25 17:33:42', NULL),
(187, 18, 'pt-PT', 'Loja', '2025-08-25 17:33:42', NULL),
(188, 20, 'pt-PT', 'Suporte ao Cliente', '2025-08-25 17:33:42', NULL),
(189, 6, 'pt-PT', 'Contato', '2025-08-25 17:33:42', NULL),
(190, 4, 'pt-PT', 'Todos os Produtos', '2025-08-25 17:33:42', NULL),
(191, 2, 'pt-PT', 'Descubra nossa coleção exclusiva de moda com materiais de qualidade premium', '2025-08-25 17:33:42', NULL),
(192, 1, 'pt-PT', 'Coleção de Moda', '2025-08-25 17:33:42', NULL),
(203, 23, 'nl-NL', 'Collectie', '2025-08-25 17:33:42', NULL),
(204, 22, 'nl-NL', 'Home', '2025-08-25 17:33:42', NULL),
(205, 16, 'nl-NL', 'Als je vragen hebt of samenwerkingsvoorstellen, horen we graag van je.', '2025-08-25 17:33:42', NULL),
(206, 30, 'nl-NL', 'Annuleren', '2025-08-25 17:33:42', NULL),
(207, 27, 'nl-NL', 'Bedrijf', '2025-08-25 17:33:42', NULL),
(208, 25, 'nl-NL', 'Email', '2025-08-25 17:33:42', NULL),
(209, 32, 'nl-NL', 'Fout bij het verzenden van bericht. Probeer het later opnieuw.', '2025-08-25 17:33:42', NULL),
(210, 28, 'nl-NL', 'Bericht', '2025-08-25 17:33:42', NULL),
(211, 24, 'nl-NL', 'Naam', '2025-08-25 17:33:42', NULL),
(212, 26, 'nl-NL', 'Telefoon', '2025-08-25 17:33:42', NULL),
(213, 29, 'nl-NL', 'Bericht Verzenden', '2025-08-25 17:33:42', NULL),
(214, 31, 'nl-NL', 'Bericht succesvol verzonden! We zullen binnenkort reageren.', '2025-08-25 17:33:42', NULL),
(215, 17, 'nl-NL', 'Neem Contact Op', '2025-08-25 17:33:42', NULL),
(216, 19, 'nl-NL', 'Collectie', '2025-08-25 17:33:42', NULL),
(217, 21, 'nl-NL', 'Neem Contact Op', '2025-08-25 17:33:42', NULL),
(218, 18, 'nl-NL', 'Winkel', '2025-08-25 17:33:42', NULL),
(219, 20, 'nl-NL', 'Klantenservice', '2025-08-25 17:33:42', NULL),
(220, 6, 'nl-NL', 'Contact', '2025-08-25 17:33:42', NULL),
(221, 4, 'nl-NL', 'Alle Producten', '2025-08-25 17:33:42', NULL),
(222, 2, 'nl-NL', 'Ontdek onze exclusieve modecollectie met premium kwaliteit materialen', '2025-08-25 17:33:42', NULL),
(223, 1, 'nl-NL', 'Mode Collectie', '2025-08-25 17:33:42', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tag`
--

CREATE TABLE `tag` (
  `id` int UNSIGNED NOT NULL,
  `tag_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='产品标签表';

-- --------------------------------------------------------

--
-- Table structure for table `translation_logs`
--

CREATE TABLE `translation_logs` (
  `id` int NOT NULL,
  `product_id` int UNSIGNED NOT NULL,
  `content_type` enum('name','description') NOT NULL,
  `source_language` varchar(10) NOT NULL,
  `target_language` varchar(10) NOT NULL,
  `original_text` text NOT NULL,
  `translated_text` text NOT NULL,
  `translation_provider` varchar(50) DEFAULT 'openai',
  `translation_timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_favorite`
--

CREATE TABLE `user_favorite` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `product_id` int UNSIGNED DEFAULT NULL,
  `variant_id` int UNSIGNED DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_session`
--

CREATE TABLE `user_session` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `session_token` char(64) COLLATE utf8mb4_general_ci NOT NULL,
  `ip` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_catalog_published`
-- (See below for the actual view)
--
CREATE TABLE `v_catalog_published` (
`id` int unsigned
,`category_id` int unsigned
,`created_at` datetime
,`updated_at` datetime
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_categories_zh_first`
-- (See below for the actual view)
--
CREATE TABLE `v_categories_zh_first` (
`id` int unsigned
,`name_zh_first` varchar(255)
,`parent_id` int unsigned
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_category_i18n_ordered`
-- (See below for the actual view)
--
CREATE TABLE `v_category_i18n_ordered` (
`category_id` int unsigned
,`locale` varchar(10)
,`name` varchar(255)
,`slug` varchar(255)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_colors_zh_first`
-- (See below for the actual view)
--
CREATE TABLE `v_colors_zh_first` (
`id` int unsigned
,`color_code` varchar(7)
,`name_zh_first` varchar(255)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_color_i18n_ordered`
-- (See below for the actual view)
--
CREATE TABLE `v_color_i18n_ordered` (
`color_id` int unsigned
,`locale` varchar(10)
,`name` varchar(255)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_materials_zh_first`
-- (See below for the actual view)
--
CREATE TABLE `v_materials_zh_first` (
`id` int unsigned
,`name_zh_first` varchar(255)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_material_i18n_ordered`
-- (See below for the actual view)
--
CREATE TABLE `v_material_i18n_ordered` (
`material_id` int unsigned
,`locale` varchar(10)
,`name` varchar(255)
);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `app_setting`
--
ALTER TABLE `app_setting`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `app_user`
--
ALTER TABLE `app_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_user_email` (`email`),
  ADD KEY `fk_user_company` (`company_id`);

--
-- Indexes for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_user` (`user_id`);

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_cat_parent_name` (`parent_id`,`category_name_en`),
  ADD KEY `idx_categories_parent` (`parent_id`);

--
-- Indexes for table `category_i18n`
--
ALTER TABLE `category_i18n`
  ADD PRIMARY KEY (`category_id`,`locale`),
  ADD KEY `idx_cat_locale_slug_norm` (`locale`,`slug_norm`);

--
-- Indexes for table `color`
--
ALTER TABLE `color`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_color_code` (`color_code`);

--
-- Indexes for table `color_i18n`
--
ALTER TABLE `color_i18n`
  ADD PRIMARY KEY (`color_id`,`locale`),
  ADD KEY `fk_color_i18n_loc` (`locale`);

--
-- Indexes for table `company`
--
ALTER TABLE `company`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_is_processed` (`is_processed`),
  ADD KEY `idx_todo_status` (`todo_status`);

--
-- Indexes for table `locales`
--
ALTER TABLE `locales`
  ADD PRIMARY KEY (`code`);

--
-- Indexes for table `material`
--
ALTER TABLE `material`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_material_name` (`material_name`);

--
-- Indexes for table `material_i18n`
--
ALTER TABLE `material_i18n`
  ADD PRIMARY KEY (`material_id`,`locale`),
  ADD KEY `fk_mat_i18n_loc` (`locale`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_products_category_id` (`category_id`),
  ADD KEY `fk_product_season` (`season_id`),
  ADD KEY `fk_product_material` (`material_id`);

--
-- Indexes for table `product_i18n`
--
ALTER TABLE `product_i18n`
  ADD PRIMARY KEY (`product_id`,`locale`),
  ADD UNIQUE KEY `uk_prod_slug` (`locale`,`slug`),
  ADD UNIQUE KEY `uniq_product_locale` (`product_id`,`locale`),
  ADD KEY `idx_product_i18n_locale` (`locale`);

--
-- Indexes for table `product_media`
--
ALTER TABLE `product_media`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_media_sort` (`variant_id`,`sort_order`),
  ADD KEY `idx_product_media_variant_id` (`variant_id`);

--
-- Indexes for table `product_tag`
--
ALTER TABLE `product_tag`
  ADD PRIMARY KEY (`product_id`,`tag_id`),
  ADD KEY `fk_pt_tag` (`tag_id`);

--
-- Indexes for table `product_variant`
--
ALTER TABLE `product_variant`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_variant_color` (`product_id`,`color_id`),
  ADD UNIQUE KEY `uk_variant_sku` (`sku`),
  ADD KEY `idx_product_variants_product_id` (`product_id`),
  ADD KEY `idx_variants_color` (`color_id`);

--
-- Indexes for table `seasons`
--
ALTER TABLE `seasons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `season_name` (`season_name`);

--
-- Indexes for table `seasons_i18n`
--
ALTER TABLE `seasons_i18n`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_season_locale` (`season_id`,`locale`),
  ADD KEY `idx_locale` (`locale`),
  ADD KEY `idx_season_id` (`season_id`);

--
-- Indexes for table `site_content`
--
ALTER TABLE `site_content`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_content_key` (`content_key`);

--
-- Indexes for table `site_content_translation`
--
ALTER TABLE `site_content_translation`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_content_locale` (`content_id`,`language_code`),
  ADD KEY `fk_content_translation` (`content_id`),
  ADD KEY `fk_sct_locale` (`language_code`);

--
-- Indexes for table `tag`
--
ALTER TABLE `tag`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tag_name` (`tag_name`);

--
-- Indexes for table `translation_logs`
--
ALTER TABLE `translation_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_translation_logs_product` (`product_id`);

--
-- Indexes for table `user_favorite`
--
ALTER TABLE `user_favorite`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_fav_user_product` (`user_id`,`product_id`),
  ADD UNIQUE KEY `uk_fav_user_variant` (`user_id`,`variant_id`),
  ADD KEY `idx_fav_user` (`user_id`),
  ADD KEY `fk_fav_product` (`product_id`),
  ADD KEY `fk_fav_variant` (`variant_id`);

--
-- Indexes for table `user_session`
--
ALTER TABLE `user_session`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_session_token` (`session_token`),
  ADD KEY `idx_session_user` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `app_user`
--
ALTER TABLE `app_user`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `audit_log`
--
ALTER TABLE `audit_log`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '分类ID，主键，自动增长', AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `color`
--
ALTER TABLE `color`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT for table `company`
--
ALTER TABLE `company`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `material`
--
ALTER TABLE `material`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '产品ID，主键，自动增长', AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `product_media`
--
ALTER TABLE `product_media`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '媒体ID，自增主键', AUTO_INCREMENT=85;

--
-- AUTO_INCREMENT for table `product_variant`
--
ALTER TABLE `product_variant`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '变体ID，主键，自动增长', AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT for table `seasons`
--
ALTER TABLE `seasons`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `seasons_i18n`
--
ALTER TABLE `seasons_i18n`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `site_content`
--
ALTER TABLE `site_content`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `site_content_translation`
--
ALTER TABLE `site_content_translation`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=224;

--
-- AUTO_INCREMENT for table `tag`
--
ALTER TABLE `tag`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `translation_logs`
--
ALTER TABLE `translation_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT for table `user_favorite`
--
ALTER TABLE `user_favorite`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_session`
--
ALTER TABLE `user_session`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

-- --------------------------------------------------------

--
-- Structure for view `v_catalog_published`
--
DROP TABLE IF EXISTS `v_catalog_published`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY INVOKER VIEW `v_catalog_published`  AS SELECT `p`.`id` AS `id`, `p`.`category_id` AS `category_id`, `p`.`created_at` AS `created_at`, `p`.`updated_at` AS `updated_at` FROM `product` AS `p` WHERE ((`p`.`status` = 'published') AND exists(select 1 from `product_i18n` `pi` where ((`pi`.`product_id` = `p`.`id`) AND (`pi`.`status` = 'published')))) ;

-- --------------------------------------------------------

--
-- Structure for view `v_categories_zh_first`
--
DROP TABLE IF EXISTS `v_categories_zh_first`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY INVOKER VIEW `v_categories_zh_first`  AS SELECT `c`.`id` AS `id`, coalesce((select `category_i18n`.`name` from `category_i18n` where ((`category_i18n`.`category_id` = `c`.`id`) and (`category_i18n`.`locale` = 'zh-CN'))),(select `category_i18n`.`name` from `category_i18n` where ((`category_i18n`.`category_id` = `c`.`id`) and (`category_i18n`.`locale` = 'en-GB'))),`c`.`category_name_en`) AS `name_zh_first`, `c`.`parent_id` AS `parent_id` FROM `category` AS `c` ;

-- --------------------------------------------------------

--
-- Structure for view `v_category_i18n_ordered`
--
DROP TABLE IF EXISTS `v_category_i18n_ordered`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY INVOKER VIEW `v_category_i18n_ordered`  AS SELECT `ci`.`category_id` AS `category_id`, `ci`.`locale` AS `locale`, `ci`.`name` AS `name`, `ci`.`slug` AS `slug` FROM (`category_i18n` `ci` join `locales` `l` on((`l`.`code` = `ci`.`locale`))) ORDER BY `ci`.`category_id` ASC, `l`.`sort_order` ASC ;

-- --------------------------------------------------------

--
-- Structure for view `v_colors_zh_first`
--
DROP TABLE IF EXISTS `v_colors_zh_first`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY INVOKER VIEW `v_colors_zh_first`  AS SELECT `c`.`id` AS `id`, `c`.`color_code` AS `color_code`, coalesce((select `color_i18n`.`name` from `color_i18n` where ((`color_i18n`.`color_id` = `c`.`id`) and (`color_i18n`.`locale` = 'zh-CN'))),(select `color_i18n`.`name` from `color_i18n` where ((`color_i18n`.`color_id` = `c`.`id`) and (`color_i18n`.`locale` = 'en-GB'))),NULL) AS `name_zh_first` FROM `color` AS `c` ;

-- --------------------------------------------------------

--
-- Structure for view `v_color_i18n_ordered`
--
DROP TABLE IF EXISTS `v_color_i18n_ordered`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY INVOKER VIEW `v_color_i18n_ordered`  AS SELECT `ci`.`color_id` AS `color_id`, `ci`.`locale` AS `locale`, `ci`.`name` AS `name` FROM (`color_i18n` `ci` join `locales` `l` on((`l`.`code` = `ci`.`locale`))) ORDER BY `ci`.`color_id` ASC, `l`.`sort_order` ASC ;

-- --------------------------------------------------------

--
-- Structure for view `v_materials_zh_first`
--
DROP TABLE IF EXISTS `v_materials_zh_first`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY INVOKER VIEW `v_materials_zh_first`  AS SELECT `m`.`id` AS `id`, coalesce((select `material_i18n`.`name` from `material_i18n` where ((`material_i18n`.`material_id` = `m`.`id`) and (`material_i18n`.`locale` = 'zh-CN'))),(select `material_i18n`.`name` from `material_i18n` where ((`material_i18n`.`material_id` = `m`.`id`) and (`material_i18n`.`locale` = 'en-GB'))),`m`.`material_name`) AS `name_zh_first` FROM `material` AS `m` ;

-- --------------------------------------------------------

--
-- Structure for view `v_material_i18n_ordered`
--
DROP TABLE IF EXISTS `v_material_i18n_ordered`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY INVOKER VIEW `v_material_i18n_ordered`  AS SELECT `mi`.`material_id` AS `material_id`, `mi`.`locale` AS `locale`, `mi`.`name` AS `name` FROM (`material_i18n` `mi` join `locales` `l` on((`l`.`code` = `mi`.`locale`))) ORDER BY `mi`.`material_id` ASC, `l`.`sort_order` ASC ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `app_user`
--
ALTER TABLE `app_user`
  ADD CONSTRAINT `fk_user_company` FOREIGN KEY (`company_id`) REFERENCES `company` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD CONSTRAINT `fk_audit_app_user` FOREIGN KEY (`user_id`) REFERENCES `app_user` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `category`
--
ALTER TABLE `category`
  ADD CONSTRAINT `fk_category_parent` FOREIGN KEY (`parent_id`) REFERENCES `category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `category_i18n`
--
ALTER TABLE `category_i18n`
  ADD CONSTRAINT `fk_cat_i18n_cat` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cat_i18n_loc` FOREIGN KEY (`locale`) REFERENCES `locales` (`code`);

--
-- Constraints for table `color_i18n`
--
ALTER TABLE `color_i18n`
  ADD CONSTRAINT `fk_color_i18n_color` FOREIGN KEY (`color_id`) REFERENCES `color` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_color_i18n_loc` FOREIGN KEY (`locale`) REFERENCES `locales` (`code`);

--
-- Constraints for table `material_i18n`
--
ALTER TABLE `material_i18n`
  ADD CONSTRAINT `fk_mat_i18n_loc` FOREIGN KEY (`locale`) REFERENCES `locales` (`code`),
  ADD CONSTRAINT `fk_mat_i18n_mat` FOREIGN KEY (`material_id`) REFERENCES `material` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product`
--
ALTER TABLE `product`
  ADD CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_product_material` FOREIGN KEY (`material_id`) REFERENCES `material` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_product_season` FOREIGN KEY (`season_id`) REFERENCES `seasons` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `product_i18n`
--
ALTER TABLE `product_i18n`
  ADD CONSTRAINT `fk_prod_i18n_loc` FOREIGN KEY (`locale`) REFERENCES `locales` (`code`),
  ADD CONSTRAINT `fk_prod_i18n_prod` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_media`
--
ALTER TABLE `product_media`
  ADD CONSTRAINT `fk_media_product` FOREIGN KEY (`variant_id`) REFERENCES `product_variant` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_tag`
--
ALTER TABLE `product_tag`
  ADD CONSTRAINT `fk_pt_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pt_tag` FOREIGN KEY (`tag_id`) REFERENCES `tag` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_variant`
--
ALTER TABLE `product_variant`
  ADD CONSTRAINT `fk_variant_color` FOREIGN KEY (`color_id`) REFERENCES `color` (`id`),
  ADD CONSTRAINT `fk_variants_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `seasons_i18n`
--
ALTER TABLE `seasons_i18n`
  ADD CONSTRAINT `seasons_i18n_ibfk_1` FOREIGN KEY (`season_id`) REFERENCES `seasons` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `site_content_translation`
--
ALTER TABLE `site_content_translation`
  ADD CONSTRAINT `fk_content_translation` FOREIGN KEY (`content_id`) REFERENCES `site_content` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_sct_locale` FOREIGN KEY (`language_code`) REFERENCES `locales` (`code`) ON UPDATE CASCADE;

--
-- Constraints for table `translation_logs`
--
ALTER TABLE `translation_logs`
  ADD CONSTRAINT `translation_logs_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_favorite`
--
ALTER TABLE `user_favorite`
  ADD CONSTRAINT `fk_fav_app_user` FOREIGN KEY (`user_id`) REFERENCES `app_user` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fav_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fav_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variant` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_session`
--
ALTER TABLE `user_session`
  ADD CONSTRAINT `fk_session_app_user` FOREIGN KEY (`user_id`) REFERENCES `app_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
