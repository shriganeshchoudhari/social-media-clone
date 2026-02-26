# Deployment Operations Manual

## 1. Introduction
This manual provides the steps necessary to deploy the Social Media Clone stack. 

## 2. Prerequisites
- Docker & Docker Compose
- Java 21 SDK
- Node.js 18+
- Maven
- A terminal with PowerShell (for utility scripts)

## 3. Deployment Steps

### Step 1: Initialize Databases
Run the provided PowerShell scripts to spin up dependent services (PostgreSQL, MongoDB, ElasticSearch, Redis) using Docker. Alternatively, leverage a `docker-compose.yml` if available.
```powershell
./install-databases.ps1
./setup-mongodb.ps1
```
Ensure databases are up by running `./verify-all-databases.ps1`.

### Step 2: Build & Start the Backend
The backend uses Flyway to auto-migrate the database schema on startup.
```bash
cd backend
mvn clean package -DskipTests
java -jar target/social-0.0.1-SNAPSHOT.jar
```
*Note: Make sure to export necessary environment variables or use an `application-prod.yml`.*

### Step 3: Build & Start the Frontend
The frontend uses Vite to bundle the static assets.
```bash
cd social-ui
npm install
npm run build
```
Once built, the `dist/` directory can be served via Nginx or integrated into the Spring Boot static resources (if configured to serve SPA). For local dev, use `npm run dev`.

## 4. Rollback Procedure
If a database migration fails, Flyway logs the error. Manually fix the migration script in `src/main/resources/db/migration/` or run `flyway:repair` if needed.
If a bad build is deployed, revert to the previous Git commit, re-run `mvn clean package`, and restart the service.
