-- Criar tabela de assinaturas para controle de pagamentos
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    plan_type VARCHAR(50) NOT NULL, -- daily, weekly, monthly
    amount DECIMAL(10,2) NOT NULL,
    reference VARCHAR(255) UNIQUE NOT NULL,
    transaction_id VARCHAR(255),
    order_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, ACTIVE, EXPIRED, CANCELLED
    starts_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_expires_at (expires_at),
    INDEX idx_reference (reference)
);

-- Criar tabela de logs de pagamento
CREATE TABLE IF NOT EXISTS payment_logs (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(255),
    charge_id VARCHAR(255),
    status VARCHAR(100),
    webhook_data JSON,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_order_id (order_id),
    INDEX idx_charge_id (charge_id)
);
