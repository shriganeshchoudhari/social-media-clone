-- Update myadmin to ADMIN role
UPDATE users SET role = 'ADMIN' WHERE username = 'myadmin';

-- Verify the change
SELECT username, email, role FROM users WHERE username = 'myadmin';
