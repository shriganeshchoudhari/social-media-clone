-- Add the missing role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'USER';

-- Update superadmin to ADMIN role
UPDATE users SET role = 'ADMIN' WHERE username = 'superadmin';

-- Verify the change
SELECT username, email, role FROM users WHERE username = 'superadmin';
