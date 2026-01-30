# Admin Setup Instructions

## The Issue
You successfully logged in with username `superadmin`, but the backend is rejecting your admin requests because your database role is still set to `'USER'` instead of `'ADMIN'`.

## Solution: Update Database Role

**Open a NEW PowerShell terminal** and run this command:

```powershell
$env:PGPASSWORD='postgres'; & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d social_media -c "UPDATE users SET role = 'ADMIN' WHERE username = 'superadmin';"
```

If that doesn't work, try the interactive approach:

```powershell
psql -U postgres -d social_media
```

Then in the PostgreSQL prompt:
```sql
UPDATE users SET role = 'ADMIN' WHERE username = 'superadmin';
\q
```

## After Updating

1. **Logout** from the application (important!)
2. **Login again** with:
   - Username: `superadmin`
   - Password: `Admin@123`
3. Navigate to `/admin` - it should work now!

The JWT token is generated during login and contains your role, so you MUST re-login after changing the database role.
