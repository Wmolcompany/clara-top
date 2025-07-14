-- Clara Zen - Database Schema
-- MySQL 8.0 compatible

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `cpf` varchar(14) DEFAULT NULL,
  `whatsapp` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('user','affiliate','admin') DEFAULT 'user',
  `plan` enum('free','premium') DEFAULT 'free',
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `email_verified` tinyint(1) DEFAULT '0',
  `email_verification_token` varchar(255) DEFAULT NULL,
  `password_reset_token` varchar(255) DEFAULT NULL,
  `password_reset_expires` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `affiliate_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `cpf` (`cpf`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_status` (`status`),
  KEY `idx_affiliate` (`affiliate_id`),
  CONSTRAINT `fk_users_affiliate` FOREIGN KEY (`affiliate_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chat messages table
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `chat_type` enum('desabafo','diario','financas','rotina','general') DEFAULT 'general',
  `message` text NOT NULL,
  `response` text,
  `sender` enum('user','clara') NOT NULL,
  `tokens_used` int DEFAULT '0',
  `model` varchar(50) DEFAULT 'gpt-3.5-turbo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_chat` (`user_id`,`chat_type`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_chat_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Diary entries table
CREATE TABLE IF NOT EXISTS `diary_entries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` text NOT NULL,
  `mood` enum('very_sad','sad','neutral','happy','very_happy') DEFAULT 'neutral',
  `mood_score` int DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `is_private` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_date` (`user_id`,`created_at`),
  KEY `idx_mood` (`mood`),
  CONSTRAINT `fk_diary_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Finance entries table
CREATE TABLE IF NOT EXISTS `finance_entries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` enum('income','expense') NOT NULL,
  `category` varchar(100) NOT NULL,
  `description` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `date` date NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_date` (`user_id`,`date`),
  KEY `idx_type_category` (`type`,`category`),
  KEY `idx_amount` (`amount`),
  CONSTRAINT `fk_finance_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Routine entries table
CREATE TABLE IF NOT EXISTS `routine_entries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `status` enum('pending','in_progress','completed','cancelled') DEFAULT 'pending',
  `due_date` date DEFAULT NULL,
  `due_time` time DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_date` (`user_id`,`due_date`),
  KEY `idx_status_priority` (`status`,`priority`),
  CONSTRAINT `fk_routine_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Affiliates table
CREATE TABLE IF NOT EXISTS `affiliates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `affiliate_code` varchar(20) NOT NULL,
  `custom_link` varchar(255) DEFAULT NULL,
  `commission_rate` decimal(5,2) DEFAULT '60.00',
  `total_clicks` int DEFAULT '0',
  `total_conversions` int DEFAULT '0',
  `total_earnings` decimal(10,2) DEFAULT '0.00',
  `available_earnings` decimal(10,2) DEFAULT '0.00',
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `affiliate_code` (`affiliate_code`),
  KEY `idx_status` (`status`),
  KEY `idx_earnings` (`total_earnings`),
  CONSTRAINT `fk_affiliate_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Affiliate clicks table
CREATE TABLE IF NOT EXISTS `affiliate_clicks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `affiliate_id` int NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `referrer` varchar(255) DEFAULT NULL,
  `converted` tinyint(1) DEFAULT '0',
  `converted_user_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_affiliate_date` (`affiliate_id`,`created_at`),
  KEY `idx_converted` (`converted`),
  CONSTRAINT `fk_click_affiliate` FOREIGN KEY (`affiliate_id`) REFERENCES `affiliates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_click_user` FOREIGN KEY (`converted_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments table
CREATE TABLE IF NOT EXISTS `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `affiliate_id` int DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `affiliate_amount` decimal(10,2) DEFAULT '0.00',
  `admin_amount` decimal(10,2) DEFAULT '0.00',
  `status` enum('pending','processing','completed','failed','refunded') DEFAULT 'pending',
  `payment_method` enum('stripe','mercadopago','pix','boleto') NOT NULL,
  `external_id` varchar(255) DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `plan_acquired` enum('free','premium') DEFAULT 'premium',
  `expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_status` (`user_id`,`status`),
  KEY `idx_affiliate` (`affiliate_id`),
  KEY `idx_external_id` (`external_id`),
  CONSTRAINT `fk_payment_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payment_affiliate` FOREIGN KEY (`affiliate_id`) REFERENCES `affiliates` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Withdrawals table
CREATE TABLE IF NOT EXISTS `withdrawals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `affiliate_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('requested','processing','completed','rejected') DEFAULT 'requested',
  `payment_method` enum('pix','bank_transfer','paypal') NOT NULL,
  `payment_details` json NOT NULL,
  `processed_at` datetime DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_affiliate_status` (`affiliate_id`,`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_withdrawal_affiliate` FOREIGN KEY (`affiliate_id`) REFERENCES `affiliates` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- System configurations table
CREATE TABLE IF NOT EXISTS `system_configs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key` varchar(100) NOT NULL,
  `value` text,
  `description` varchar(255) DEFAULT NULL,
  `type` enum('string','number','boolean','json') DEFAULT 'string',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default configurations
INSERT INTO `system_configs` (`key`, `value`, `description`, `type`) VALUES
('openai_api_key', '', 'OpenAI API Key for Clara AI', 'string'),
('clara_initial_message', 'Olá! Sou a Clara, sua assistente virtual. Como posso te ajudar hoje? 💚', 'Initial message from Clara', 'string'),
('footer_notice', 'Clara Zen - Sua assistente virtual inteligente', 'Footer notice text', 'string'),
('stripe_public_key', '', 'Stripe public key', 'string'),
('stripe_secret_key', '', 'Stripe secret key', 'string'),
('mercadopago_public_key', '', 'Mercado Pago public key', 'string'),
('mercadopago_access_token', '', 'Mercado Pago access token', 'string'),
('premium_plan_price', '29.90', 'Premium plan monthly price', 'number'),
('affiliate_commission_rate', '60', 'Default affiliate commission rate (%)', 'number'),
('minimum_withdrawal_amount', '50.00', 'Minimum amount for withdrawal', 'number'),
('max_free_messages', '10', 'Maximum messages per day for free users', 'number'),
('email_smtp_host', '', 'SMTP host for emails', 'string'),
('email_smtp_port', '587', 'SMTP port for emails', 'number'),
('email_smtp_user', '', 'SMTP username', 'string'),
('email_smtp_pass', '', 'SMTP password', 'string');

-- Insert default admin user
INSERT INTO `users` (`name`, `email`, `password_hash`, `role`, `plan`, `status`, `email_verified`) VALUES
('Administrador', 'admin@clarazen.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'premium', 'active', 1);

-- Create indexes for better performance
CREATE INDEX `idx_chat_messages_user_type_date` ON `chat_messages` (`user_id`, `chat_type`, `created_at`);
CREATE INDEX `idx_diary_entries_user_mood_date` ON `diary_entries` (`user_id`, `mood`, `created_at`);
CREATE INDEX `idx_finance_entries_user_type_date` ON `finance_entries` (`user_id`, `type`, `date`);
CREATE INDEX `idx_routine_entries_user_status_date` ON `routine_entries` (`user_id`, `status`, `due_date`);

SET FOREIGN_KEY_CHECKS = 1;