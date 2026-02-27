-- Useful Database Queries for Admin / Setup
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'USER';
UPDATE users SET role = 'ADMIN' WHERE username = 'superadmin';
UPDATE users SET role = 'ADMIN' WHERE username = 'myadmin';
UPDATE users SET password = '.kkEHR6H5lBx5j7BRe' WHERE username = 'testuser2';
SELECT id, username, email, role FROM users;
