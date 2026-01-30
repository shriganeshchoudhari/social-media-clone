UPDATE users SET role = 'ADMIN' WHERE username = 'superadmin';
SELECT username, email, role FROM users WHERE username = 'superadmin';
