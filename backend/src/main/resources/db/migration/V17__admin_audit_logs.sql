CREATE TABLE admin_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_id BIGINT NOT NULL REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    target_username VARCHAR(50),
    details TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
