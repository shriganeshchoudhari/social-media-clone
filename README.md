# Social Media Clone

A full-stack social media application built with Spring Boot (Java) for the backend and React (Vite, Tailwind CSS) for the frontend.

## 🚀 Tech Stack

- **Backend**: Java 17+, Spring Boot, PostgreSQL (Relational Data), MongoDB (NoSQL Data for features like Chat), Spring Security (JWT), Hibernate/JPA.
- **Frontend**: React 18, Vite, Tailwind CSS, Axios, React Router.
- **DevOps**: Docker, Docker Compose, Kubernetes (Helm), AWS EC2.

## 📂 Project Structure Overview

- `/backend` - Contains the Spring Boot Java source code, application properties, and Maven build files.
- `/social-ui` - Contains the Vite/React frontend source code and Tailwind configuration.
- `/scripts` - Contains various utility scripts for deployment and local testing.
- `/helm` - Contains Kubernetes Helm charts for deploying the application to a cluster.
- `/docs` - Contains project documentation.
- `/api-tests` - Contains files for API testing (e.g., Postman collections or `.http` files).

---

## 🛠️ Utility Scripts (`/scripts`)

The following scripts are provided to help with local development, port-forwarding, and deployment. They have been organized into the `/scripts` directory.

### `scripts/start-local.ps1`
**Purpose**: Starts Kubernetes port-forwarding for all essential services when running the application locally on a Kubernetes cluster (like Docker Desktop or Kind).
**Usage**: 
```powershell
.\scripts\start-local.ps1
```
**Effect**: Makes Frontend accessible at `localhost:5173`, Backend at `localhost:8081`, pgAdmin at `5050`, Prometheus at `9090`, and Grafana at `3000`.

### `scripts/port-forward.ps1`
**Purpose**: An alternative/more detailed script to set up individual port-forwarding processes for all services (Frontend, Backend, Grafana, Prometheus, pgAdmin) running in the `social-media` namespace.
**Usage**: 
```powershell
.\scripts\port-forward.ps1
```
**Effect**: Launches background PowerShell windows to keep the ports open on your `localhost`.

### `scripts/start-tunnels.bat`
**Purpose**: Creates public internet tunnels (using `devtunnel`) to expose your local Frontend (`5173`) and Backend (`8081`) to the internet securely.
**Usage**: 
```cmd
scripts\start-tunnels.bat
```
**Effect**: Provides public URLs that you can use to test the application from external devices (e.g., your smartphone).

### `scripts/deploy.ps1`
**Purpose**: A comprehensive deployment script that builds Docker images for the frontend and backend, loads them into a kind cluster (or Docker Desktop), and deploys the Helm chart located in `/helm/social-media-clone`.
**Usage**:
```powershell
.\scripts\deploy.ps1
```
**Flags**:
- `-SkipBuild`: Skips building Docker images.
- `-SkipLoad`: Skips loading images into Kind.
- `-Uninstall`: Uninstalls the Helm release and deletes the namespace.

### `scripts/aws-ec2-setup.sh`
**Purpose**: AWS EC2 User Data script to quickly bootstrap a new Amazon Linux 2023 instance with Docker and Docker Compose.
**Usage**: Paste the contents of this script into the "User Data" section when launching a new EC2 instance on AWS.
**Effect**: Installs dependencies and prepares the `/home/ec2-user/social-app` directory.

---

## 🏃 Getting Started (Local Development)

### Prerequisites

- Node.js (v18+)
- Java 17+
- Maven
- Docker and Docker Compose (Optional, but recommended for database spin-up)

### Environment Configuration

Ensure you create a `.env` file in the root directory. You can copy the provided `.env.example`:
```bash
cp .env.example .env
```
Update the `.env` values as needed for your specific local database usernames and passwords.

### Running via Application (Without Docker)

1. **Start the Database** (Recommended: Use the `docker-compose.yml` file to start PostgreSQL/MongoDB).
   ```bash
   docker compose up -d
   ```

2. **Start the Backend**:
   Navigate to the `/backend` folder and run:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

3. **Start the Frontend**:
   Navigate to the `/social-ui` folder, install dependencies, and run:
   ```bash
   cd social-ui
   npm install
   npm run dev
   ```

Visit `http://localhost:5173` to view the application!
