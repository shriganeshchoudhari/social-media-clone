-- Reset testuser2 password to: password123
-- This updates the password hash in the database

UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMye7Iy2WpQw5kKF3.kkEHR6H5lBx5j7BRe'
WHERE username = 'testuser2';

-- Verify the update
SELECT username, email, role, is_private 
FROM users 
WHERE username = 'testuser2';

-- The new password is: password123
