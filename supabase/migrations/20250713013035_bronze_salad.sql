-- Clara Zen - Sistema Completo
-- Banco de dados para Hostinger Business

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    whatsapp VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    tipo ENUM('admin', 'afiliado', 'usuario') DEFAULT 'usuario',
    plano ENUM('free', 'premium') DEFAULT 'free',
    status ENUM('ativo', 'inativo', 'suspenso') DEFAULT 'ativo',
    afiliado_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (afiliado_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_cpf (cpf),
    INDEX idx_tipo (tipo),
    INDEX idx_afiliado (afiliado_id)
);

-- Tabela de interações com IA
CREATE TABLE IF NOT EXISTS interacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    pergunta TEXT NOT NULL,
    resposta TEXT NOT NULL,
    tokens_usados INT DEFAULT 0,
    modelo VARCHAR(50) DEFAULT 'gpt-3.5-turbo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, created_at)
);

-- Tabela de afiliados
CREATE TABLE IF NOT EXISTS afiliados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    codigo_afiliado VARCHAR(20) UNIQUE NOT NULL,
    link_personalizado VARCHAR(255) NOT NULL,
    cliques INT DEFAULT 0,
    conversoes INT DEFAULT 0,
    ganhos_totais DECIMAL(10,2) DEFAULT 0.00,
    ganhos_disponiveis DECIMAL(10,2) DEFAULT 0.00,
    percentual_comissao DECIMAL(5,2) DEFAULT 60.00,
    status ENUM('ativo', 'inativo', 'suspenso') DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_afiliado (user_id),
    INDEX idx_codigo (codigo_afiliado)
);

-- Tabela de cliques em links de afiliado
CREATE TABLE IF NOT EXISTS cliques_afiliado (
    id INT AUTO_INCREMENT PRIMARY KEY,
    afiliado_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    converteu BOOLEAN DEFAULT FALSE,
    user_convertido_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (afiliado_id) REFERENCES afiliados(id) ON DELETE CASCADE,
    FOREIGN KEY (user_convertido_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_afiliado_data (afiliado_id, created_at)
);

-- Tabela de pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    status ENUM('pendente', 'aprovado', 'cancelado', 'estornado') DEFAULT 'pendente',
    metodo ENUM('stripe', 'mercadopago', 'pix', 'boleto') NOT NULL,
    transaction_id VARCHAR(255),
    afiliado_id INT NULL,
    valor_afiliado DECIMAL(10,2) DEFAULT 0.00,
    valor_admin DECIMAL(10,2) DEFAULT 0.00,
    plano_adquirido ENUM('free', 'premium') DEFAULT 'premium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (afiliado_id) REFERENCES afiliados(id) ON DELETE SET NULL,
    INDEX idx_user_status (user_id, status),
    INDEX idx_afiliado (afiliado_id)
);

-- Tabela de saques
CREATE TABLE IF NOT EXISTS saques (
    id INT AUTO_INCREMENT PRIMARY KEY,
    afiliado_id INT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    status ENUM('solicitado', 'processando', 'pago', 'cancelado') DEFAULT 'solicitado',
    metodo_saque ENUM('pix', 'transferencia', 'paypal') NOT NULL,
    dados_bancarios JSON,
    observacoes TEXT,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (afiliado_id) REFERENCES afiliados(id) ON DELETE CASCADE,
    INDEX idx_afiliado_status (afiliado_id, status)
);

-- Tabela de diário
CREATE TABLE IF NOT EXISTS diario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    titulo VARCHAR(255),
    conteudo TEXT NOT NULL,
    humor ENUM('muito_triste', 'triste', 'neutro', 'feliz', 'muito_feliz') DEFAULT 'neutro',
    tags VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, created_at)
);

-- Tabela de rotina
CREATE TABLE IF NOT EXISTS rotina (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    horario TIME,
    dias_semana SET('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'),
    concluida BOOLEAN DEFAULT FALSE,
    data_conclusao DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, created_at)
);

-- Tabela de finanças
CREATE TABLE IF NOT EXISTS financas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    tipo ENUM('receita', 'despesa') NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data_transacao DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_tipo (user_id, tipo),
    INDEX idx_user_data (user_id, data_transacao)
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS configuracoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descricao VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de tokens de recuperação de senha
CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token),
    INDEX idx_email (email)
);

-- Inserir configurações padrão
INSERT INTO configuracoes (chave, valor, descricao) VALUES
('openai_api_key', '', 'Chave da API OpenAI'),
('clara_texto_inicial', 'Olá! Sou a Clara, sua assistente virtual. Como posso te ajudar hoje?', 'Texto inicial da Clara'),
('rodape_aviso', 'Clara Zen - Sua assistente virtual inteligente', 'Texto do rodapé'),
('stripe_public_key', '', 'Chave pública do Stripe'),
('stripe_secret_key', '', 'Chave secreta do Stripe'),
('mercadopago_public_key', '', 'Chave pública do Mercado Pago'),
('mercadopago_access_token', '', 'Token de acesso do Mercado Pago'),
('valor_plano_premium', '29.90', 'Valor do plano premium mensal'),
('percentual_afiliado', '60', 'Percentual de comissão do afiliado'),
('valor_minimo_saque', '50.00', 'Valor mínimo para saque');

-- Inserir usuário admin padrão
INSERT INTO users (nome, email, cpf, whatsapp, password_hash, tipo, plano) VALUES
('Administrador', 'admin@clarazen.com', '00000000000', '11999999999', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'premium');

-- Criar índices para performance
CREATE INDEX idx_interacoes_user_recent ON interacoes(user_id, created_at DESC);
CREATE INDEX idx_pagamentos_status_date ON pagamentos(status, created_at);
CREATE INDEX idx_cliques_afiliado_date ON cliques_afiliado(afiliado_id, created_at);