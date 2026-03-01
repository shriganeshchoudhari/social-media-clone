# Deployment Operations Manual

## 1. Introduction
This manual provides step-by-step instructions to set up, deploy, monitor, and operate the Social Media Clone application stack in both **local development** and **production-like** environments.

The application consists of:
1. **Backend**: Spring Boot 3 / Java 21 application (Maven project)
2. **Frontend**: React 18 / Vite application
3. **PostgreSQL**: Primary relational database
4. **MongoDB**: Document database for chat messages
5. **Redis**: Caching and rate limiting
6. **Elasticsearch**: Full-text search index

---

## 2. Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Java JDK | 21 | Backend runtime |
| Apache Maven | 3.9+ | Backend build tool |
| Node.js | 18+ | Frontend runtime |
| npm | 9+ | Frontend package manager |
| Docker Desktop | Latest | Running database containers |
| PowerShell | 5.1+ (or Core) | Running utility scripts |

---

## 3. Local Development Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/shriganeshchoudhari/social-media-clone.git
cd social-media-clone
```

### Step 2: Start All Database Services
The `scripts/` directory contains PowerShell helper scripts to start all services:

```powershell
# Install and start PostgreSQL, MongoDB, Redis, Elasticsearch in Docker
./scripts/install-databases.ps1

# Verify all databases are running correctly
./scripts/verify-all-databases.ps1
```

**Manual Docker Commands (Alternative)**:
```bash
# PostgreSQL
docker run -d --name pg_social -e POSTGRES_USER=social -e POSTGRES_PASSWORD=social_pass -e POSTGRES_DB=socialdb -p 5432:5432 postgres:15

# MongoDB
docker run -d --name mongo_social -p 27017:27017 mongo:6

# Redis
docker run -d --name redis_social -p 6379:6379 redis:7

# Elasticsearch
docker run -d --name es_social -e "discovery.type=single-node" -p 9200:9200 elasticsearch:8.9.0
```

### Step 3: Configure Backend Application
Edit `backend/src/main/resources/application.yml` (or create `application-dev.yml`):
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/socialdb
    username: social
    password: social_pass
  data:
    mongodb:
      uri: mongodb://localhost:27017/chatdb
    redis:
      host: localhost
      port: 6379
  elasticsearch:
    uris: http://localhost:9200

jwt:
  secret: your_super_secret_jwt_key_here_change_in_production
  expiration: 86400000  # 24 hours in ms
```

### Step 4: Run the Backend
```bash
cd backend
mvn spring-boot:run
```
The backend starts on `http://localhost:8080`. Swagger UI is at `http://localhost:8080/swagger-ui.html`.

**One-time build** (skipping tests):
```bash
mvn clean package -DskipTests
java -jar target/social-0.0.1-SNAPSHOT.jar
```

### Step 5: Run the Frontend
```bash
cd social-ui
npm install
npm run dev
```
The frontend starts on `http://localhost:5173`. It proxies API requests to `http://localhost:8080` automatically (configured in `vite.config.js`).

---

## 4. Quick Start Script

A combined script to start both backend and frontend:
```powershell
./scripts/start-all.bat
```
Or to use tunnels for external access (e.g., for testing from mobile):
```powershell
./scripts/start-tunnels.bat
```

---

## 5. Production Deployment

### Backend (JAR + Nginx Reverse Proxy)

**Build Production JAR**:
```bash
cd backend
mvn clean package -DskipTests
java -jar target/social-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

**Nginx Configuration** (`/etc/nginx/sites-available/social-media.conf`):
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /ws {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location / {
        root /var/www/social-ui/dist;
        try_files $uri /index.html;
    }
}
```

**Frontend Build**:
```bash
cd social-ui
npm run build
# Copy dist/ to /var/www/social-ui/dist
```

---

## 6. Environment Variables (Production)

Never commit secrets to Git. Use environment variables or a secrets manager:

| Variable | Description |
|---|---|
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | DB username |
| `SPRING_DATASOURCE_PASSWORD` | DB password |
| `SPRING_DATA_MONGODB_URI` | MongoDB connection URI |
| `SPRING_DATA_REDIS_HOST` | Redis host |
| `JWT_SECRET` | JWT signing secret (min 32 chars) |
| `FILE_UPLOAD_DIR` | Server directory for uploaded files |

---

## 7. Database Migrations (Flyway)

The backend uses **Flyway** for automated schema migrations. On application startup:
1. Flyway connects to PostgreSQL.
2. It checks the `flyway_schema_history` table to determine which migrations have been applied.
3. It applies any pending `.sql` scripts from `src/main/resources/db/migration/` in version order.

**Migration script naming convention**: `V{version}__{description}.sql`
Example: `V1__Create_users_table.sql`, `V2__Add_verified_column.sql`

**If a migration fails**:
```bash
mvn flyway:repair    # Resets the failed migration marker
# Fix the SQL script, then restart the application
```

---

## 8. Health Monitoring

The Spring Boot Actuator exposes management endpoints. Enable in `application.yml`:
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health, info, metrics, loggers
```

| Endpoint | URL | Description |
|---|---|---|
| Health | `/actuator/health` | Reports DB connections and app status |
| Info | `/actuator/info` | Custom app info (version, etc.) |
| Metrics | `/actuator/metrics/{name}` | JVM, HTTP request, DB pool metrics |

---

## 9. Rollback Procedure

### Code Rollback
1. Identify the previous stable Git tag or commit SHA.
2. `git checkout <commit-sha>`
3. Re-run `mvn clean package -DskipTests`
4. Restart the service.

### Database Rollback
- Flyway does not automatically roll back applied migrations.
- If needed, write a new `V{next_version}__Rollback_description.sql` migration that reverses the change.

### Frontend Rollback
1. Keep the previous `dist/` build archived.
2. Replace the current deployment directory with the archived version.

---

## 10. Troubleshooting

| Issue | Likely Cause | Solution |
|---|---|---|
| `ECONNREFUSED 8080` from frontend | Backend not running | Check `mvn spring-boot:run` output |
| CORS error in browser | Backend not whitelisting Vite origin | Add `http://localhost:5173` to CORS config |
| `401 Unauthorized` on all requests | JWT secret mismatch between dev/prod | Ensure `jwt.secret` is same on both |
| `PSQLException: Connection refused` | PostgreSQL Docker not running | Run `docker start pg_social` |
| MongoDB `Connection refused` on chat | MongoDB Docker not running | Run `docker start mongo_social` |
| Slow search results | Elasticsearch not indexed | Trigger `UserSyncService.syncUser()` or rebuild index |
