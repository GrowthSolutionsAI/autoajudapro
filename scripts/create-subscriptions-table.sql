-- Criar tabela de assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    plan_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    amount DECIMAL(10,2) NOT NULL,
    reference VARCHAR(255) UNIQUE NOT NULL,
    payment_id VARCHAR(255),
    payment_method VARCHAR(50) DEFAULT 'PIX',
    txid VARCHAR(255),
    pix_key TEXT,
    starts_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_reference (reference),
    INDEX idx_status (status),
    INDEX idx_expires_at (expires_at)
);

-- Criar tabela de pagamentos
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    reference VARCHAR(255) UNIQUE NOT NULL,
    txid VARCHAR(255) UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    amount DECIMAL(10,2) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_document VARCHAR(20),
    plan_id VARCHAR(50) NOT NULL,
    provider VARCHAR(50) DEFAULT 'banco-inter',
    pix_key TEXT,
    qr_code TEXT,
    webhook_received_at TIMESTAMP,
    confirmed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_reference (reference),
    INDEX idx_txid (txid),
    INDEX idx_status (status),
    INDEX idx_customer_email (customer_email)
);

-- Inserir dados de teste
INSERT INTO subscriptions (email, plan_type, status, amount, reference, starts_at, expires_at) 
VALUES 
('teste@autoajuda.com', 'monthly', 'ACTIVE', 79.90, 'test-ref-001', NOW(), NOW() + INTERVAL '30 days'),
('premium@autoajuda.com', 'weekly', 'ACTIVE', 29.90, 'test-ref-002', NOW(), NOW() + INTERVAL '7 days')
ON CONFLICT (reference) DO NOTHING;

SELECT 'Tabelas de assinatura criadas com sucesso!' as result;
