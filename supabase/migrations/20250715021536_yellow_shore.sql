-- Clara Zen - Sistema de Afiliados e Pagamentos
-- Migration para adicionar sistema completo de afiliados

-- Tabela de planos de assinatura
CREATE TABLE IF NOT EXISTS `subscription_plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `billing_cycle` enum('monthly','yearly','trial') NOT NULL,
  `trial_days` int DEFAULT 0,
  `features` json DEFAULT NULL,
  `stripe_price_id` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir planos padrão
INSERT INTO `subscription_plans` (`name`, `slug`, `price`, `billing_cycle`, `trial_days`, `features`, `stripe_price_id`) VALUES
('Free', 'free', 0.00, 'monthly', 0, '["10 mensagens por dia", "Funcionalidades básicas"]', NULL),
('Premium Mensal', 'premium-monthly', 29.90, 'monthly', 7, '["Mensagens ilimitadas", "Todas as funcionalidades", "Suporte prioritário"]', NULL),
('Premium Anual', 'premium-yearly', 229.90, 'yearly', 7, '["Mensagens ilimitadas", "Todas as funcionalidades", "Suporte prioritário", "2 meses grátis"]', NULL);

-- Tabela de afiliados
CREATE TABLE IF NOT EXISTS `affiliates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `parent_affiliate_id` int DEFAULT NULL,
  `affiliate_code` varchar(20) NOT NULL,
  `document_type` enum('cpf','cnpj') NOT NULL,
  `document_number` varchar(18) NOT NULL,
  `commission_type` enum('cpa','recurring') NOT NULL DEFAULT 'recurring',
  `commission_rate` decimal(5,2) DEFAULT 50.00,
  `commission_value` decimal(10,2) DEFAULT NULL,
  `pix_key_type` enum('phone','email','cpf','cnpj','random') DEFAULT NULL,
  `pix_key` varchar(255) DEFAULT NULL,
  `pix_account_name` varchar(255) DEFAULT NULL,
  `total_clicks` int DEFAULT 0,
  `total_conversions` int DEFAULT 0,
  `total_earnings` decimal(10,2) DEFAULT 0.00,
  `available_earnings` decimal(10,2) DEFAULT 0.00,
  `pending_earnings` decimal(10,2) DEFAULT 0.00,
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `affiliate_code` (`affiliate_code`),
  UNIQUE KEY `document_number` (`document_number`),
  KEY `idx_parent_affiliate` (`parent_affiliate_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_affiliate_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_affiliate_parent` FOREIGN KEY (`parent_affiliate_id`) REFERENCES `affiliates` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de cliques de afiliado
CREATE TABLE IF NOT EXISTS `affiliate_clicks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `affiliate_id` int NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `referrer` varchar(255) DEFAULT NULL,
  `utm_source` varchar(100) DEFAULT NULL,
  `utm_medium` varchar(100) DEFAULT NULL,
  `utm_campaign` varchar(100) DEFAULT NULL,
  `converted` tinyint(1) DEFAULT 0,
  `converted_user_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_affiliate_date` (`affiliate_id`,`created_at`),
  KEY `idx_converted` (`converted`),
  KEY `idx_ip_date` (`ip_address`,`created_at`),
  CONSTRAINT `fk_click_affiliate` FOREIGN KEY (`affiliate_id`) REFERENCES `affiliates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_click_user` FOREIGN KEY (`converted_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de assinaturas
CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `plan_id` int NOT NULL,
  `affiliate_id` int DEFAULT NULL,
  `stripe_subscription_id` varchar(255) DEFAULT NULL,
  `stripe_customer_id` varchar(255) DEFAULT NULL,
  `status` enum('active','canceled','past_due','unpaid','trialing','incomplete') DEFAULT 'active',
  `current_period_start` datetime NOT NULL,
  `current_period_end` datetime NOT NULL,
  `trial_start` datetime DEFAULT NULL,
  `trial_end` datetime DEFAULT NULL,
  `canceled_at` datetime DEFAULT NULL,
  `ended_at` datetime DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'BRL',
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stripe_subscription_id` (`stripe_subscription_id`),
  KEY `idx_user_status` (`user_id`,`status`),
  KEY `idx_affiliate` (`affiliate_id`),
  KEY `idx_plan` (`plan_id`),
  KEY `idx_period_end` (`current_period_end`),
  CONSTRAINT `fk_subscription_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_subscription_plan` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_subscription_affiliate` FOREIGN KEY (`affiliate_id`) REFERENCES `affiliates` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de comissões
CREATE TABLE IF NOT EXISTS `commissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `affiliate_id` int NOT NULL,
  `parent_affiliate_id` int DEFAULT NULL,
  `subscription_id` int NOT NULL,
  `user_id` int NOT NULL,
  `type` enum('cpa','recurring','sub_affiliate') NOT NULL,
  `level` int DEFAULT 1,
  `amount` decimal(10,2) NOT NULL,
  `rate` decimal(5,2) NOT NULL,
  `status` enum('pending','available','paid','canceled') DEFAULT 'pending',
  `available_at` datetime DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `reference_month` date DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_affiliate_status` (`affiliate_id`,`status`),
  KEY `idx_parent_affiliate` (`parent_affiliate_id`),
  KEY `idx_subscription` (`subscription_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_available_at` (`available_at`),
  KEY `idx_reference_month` (`reference_month`),
  CONSTRAINT `fk_commission_affiliate` FOREIGN KEY (`affiliate_id`) REFERENCES `affiliates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_commission_parent` FOREIGN KEY (`parent_affiliate_id`) REFERENCES `affiliates` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_commission_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_commission_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de saques
CREATE TABLE IF NOT EXISTS `withdrawals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `affiliate_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `pix_key_type` enum('phone','email','cpf','cnpj','random') NOT NULL,
  `pix_key` varchar(255) NOT NULL,
  `pix_account_name` varchar(255) NOT NULL,
  `status` enum('requested','approved','processing','completed','rejected','canceled') DEFAULT 'requested',
  `admin_notes` text,
  `processed_by` int DEFAULT NULL,
  `processed_at` datetime DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `receipt_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_affiliate_status` (`affiliate_id`,`status`),
  KEY `idx_processed_by` (`processed_by`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_withdrawal_affiliate` FOREIGN KEY (`affiliate_id`) REFERENCES `affiliates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_withdrawal_processor` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de configurações do sistema (expandida)
INSERT INTO `system_configs` (`key`, `value`, `description`, `type`) VALUES
('stripe_publishable_key', '', 'Stripe Publishable Key', 'string'),
('stripe_secret_key', '', 'Stripe Secret Key', 'string'),
('stripe_webhook_secret', '', 'Stripe Webhook Secret', 'string'),
('mercadopago_public_key', '', 'Mercado Pago Public Key', 'string'),
('mercadopago_access_token', '', 'Mercado Pago Access Token', 'string'),
('default_commission_rate', '50.00', 'Default commission rate (%)', 'number'),
('sub_affiliate_rate', '10.00', 'Sub-affiliate commission rate (%)', 'number'),
('commission_hold_days', '7', 'Days to hold commission before release', 'number'),
('minimum_withdrawal_amount', '50.00', 'Minimum withdrawal amount', 'number'),
('company_name', 'Clara Zen', 'Company name for invoices', 'string'),
('company_document', '', 'Company CNPJ', 'string'),
('support_email', 'suporte@clarazen.com.br', 'Support email', 'string'),
('trial_days_default', '7', 'Default trial days', 'number'),
('max_free_messages_daily', '10', 'Max free messages per day', 'number')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- Atualizar tabela de usuários para incluir campos de afiliado
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `referred_by` int DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `subscription_status` enum('free','trial','active','canceled','past_due') DEFAULT 'free',
ADD COLUMN IF NOT EXISTS `subscription_expires_at` datetime DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `stripe_customer_id` varchar(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `daily_message_count` int DEFAULT 0,
ADD COLUMN IF NOT EXISTS `last_message_date` date DEFAULT NULL,
ADD INDEX IF NOT EXISTS `idx_referred_by` (`referred_by`),
ADD INDEX IF NOT EXISTS `idx_subscription_status` (`subscription_status`),
ADD INDEX IF NOT EXISTS `idx_subscription_expires` (`subscription_expires_at`),
ADD CONSTRAINT `fk_user_referrer` FOREIGN KEY (`referred_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

-- Triggers para atualizar saldos de afiliados
DELIMITER $$

CREATE TRIGGER IF NOT EXISTS `update_affiliate_earnings_after_commission_insert`
AFTER INSERT ON `commissions`
FOR EACH ROW
BEGIN
    UPDATE `affiliates` 
    SET 
        `total_earnings` = `total_earnings` + NEW.amount,
        `pending_earnings` = `pending_earnings` + NEW.amount
    WHERE `id` = NEW.affiliate_id;
    
    IF NEW.parent_affiliate_id IS NOT NULL THEN
        UPDATE `affiliates` 
        SET 
            `total_earnings` = `total_earnings` + NEW.amount,
            `pending_earnings` = `pending_earnings` + NEW.amount
        WHERE `id` = NEW.parent_affiliate_id;
    END IF;
END$$

CREATE TRIGGER IF NOT EXISTS `update_affiliate_earnings_after_commission_update`
AFTER UPDATE ON `commissions`
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        IF NEW.status = 'available' THEN
            UPDATE `affiliates` 
            SET 
                `pending_earnings` = `pending_earnings` - NEW.amount,
                `available_earnings` = `available_earnings` + NEW.amount
            WHERE `id` = NEW.affiliate_id;
        ELSEIF NEW.status = 'paid' THEN
            UPDATE `affiliates` 
            SET 
                `available_earnings` = `available_earnings` - NEW.amount
            WHERE `id` = NEW.affiliate_id;
        ELSEIF NEW.status = 'canceled' THEN
            UPDATE `affiliates` 
            SET 
                `total_earnings` = `total_earnings` - NEW.amount,
                `pending_earnings` = GREATEST(0, `pending_earnings` - NEW.amount),
                `available_earnings` = GREATEST(0, `available_earnings` - NEW.amount)
            WHERE `id` = NEW.affiliate_id;
        END IF;
    END IF;
END$$

DELIMITER ;

-- Índices adicionais para performance
CREATE INDEX `idx_commissions_available_at` ON `commissions` (`available_at`);
CREATE INDEX `idx_subscriptions_period_end` ON `subscriptions` (`current_period_end`);
CREATE INDEX `idx_users_subscription_expires` ON `users` (`subscription_expires_at`);
CREATE INDEX `idx_affiliate_clicks_converted` ON `affiliate_clicks` (`converted`, `created_at`);

-- Views para relatórios
CREATE OR REPLACE VIEW `affiliate_stats` AS
SELECT 
    a.id,
    a.user_id,
    u.name,
    u.email,
    a.affiliate_code,
    a.commission_type,
    a.commission_rate,
    a.total_clicks,
    a.total_conversions,
    a.total_earnings,
    a.available_earnings,
    a.pending_earnings,
    a.status,
    COUNT(DISTINCT ac.id) as clicks_this_month,
    COUNT(DISTINCT CASE WHEN ac.converted = 1 THEN ac.id END) as conversions_this_month,
    COALESCE(SUM(CASE WHEN c.status = 'pending' THEN c.amount ELSE 0 END), 0) as pending_commissions,
    COALESCE(SUM(CASE WHEN c.status = 'available' THEN c.amount ELSE 0 END), 0) as available_commissions,
    a.created_at
FROM `affiliates` a
JOIN `users` u ON a.user_id = u.id
LEFT JOIN `affiliate_clicks` ac ON a.id = ac.affiliate_id AND ac.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
LEFT JOIN `commissions` c ON a.id = c.affiliate_id
GROUP BY a.id;

CREATE OR REPLACE VIEW `subscription_stats` AS
SELECT 
    sp.name as plan_name,
    sp.price,
    sp.billing_cycle,
    COUNT(*) as total_subscriptions,
    COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active_subscriptions,
    COUNT(CASE WHEN s.status = 'trialing' THEN 1 END) as trial_subscriptions,
    COUNT(CASE WHEN s.status = 'canceled' THEN 1 END) as canceled_subscriptions,
    SUM(CASE WHEN s.status = 'active' THEN s.amount ELSE 0 END) as monthly_revenue
FROM `subscription_plans` sp
LEFT JOIN `subscriptions` s ON sp.id = s.plan_id
GROUP BY sp.id;