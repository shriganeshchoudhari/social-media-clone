UPDATE users SET "role" = 'ADMIN' WHERE username = 'superadmin';
SELECT username, "role" FROM users WHERE username = 'superadmin';
