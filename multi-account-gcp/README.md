# Multi-Account GCP Application - Complete Setup

A full-stack application with **Spring Boot** backend, **React** frontend, **PostgreSQL**, **Redis**, **RabbitMQ**, **MinIO**, and **SQL Server** - all containerized with Docker.

---

## 🚀 Quick Start (Automated Setup)

### Prerequisites
- **Docker** and **Docker Compose** installed (script will guide you if not)
- **8GB RAM** minimum
- **Internet connection** for downloading images

### For Linux/Mac Users:
```bash
chmod +x setup.sh
./setup.sh
```

chmod +x install.sh && ./install.sh

### For Windows Users (Command Prompt):
```cmd
setup.bat
```

### For Windows Users (PowerShell):
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\setup.ps1
```

**That's it!** The script will:
1. ✅ Check and install Docker/Docker Compose (if needed)
2. ✅ Build all Docker images
3. ✅ Start all services
4. ✅ Wait for services to be ready
5. ✅ Display access URLs

---

## 📱 Access Your Application

Once setup is complete, access:

- **🌐 Frontend Dashboard**: http://localhost:3001
- **🔧 Backend API**: http://localhost:8081
- **🐰 RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **📦 MinIO Console**: http://localhost:9000 (minioadmin/minioadmin)

---

## 🏗️ Architecture

### Services Overview
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend    │────▶│ PostgreSQL  │
│   (React)   │     │ (Spring Boot)│     │  Database   │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ├──────────────▶ Redis (Cache)
                           │
                           ├──────────────▶ RabbitMQ (Events)
                           │
                           └──────────────▶ MinIO (Files)
```

### Tech Stack
- **Backend**: Spring Boot 3.1.6 + Java 17
- **Frontend**: React 18 + Vite 4.4.9
- **Database**: PostgreSQL 15 with Flyway migrations
- **Cache**: Redis 7 with auto-expiry (1 hour TTL)
- **Message Queue**: RabbitMQ 3.11
- **Object Storage**: MinIO (S3-compatible)
- **Additional DB**: SQL Server 2019

---

## 📊 Features

### 1️⃣ **SQL Data Table** (PostgreSQL)
- Full CRUD operations on items
- Automatic timestamps
- Database migrations with Flyway

### 2️⃣ **Redis Cache Table**
- **Auto-caching**: Items cached on create/get operations
- **TTL**: 1-hour expiration
- **Cache-aside pattern**: Falls back to DB on cache miss
- Real-time TTL display

### 3️⃣ **Bucket Data Table** (File Storage)
- File upload functionality
- Stores files with timestamps
- Shows file size and upload date

### 4️⃣ **Real-time Dashboard**
- Auto-refreshes every 3 seconds
- Service status monitoring
- Worker logs display
- Cache statistics

---

## 🧪 Testing the API

### Create an Item
```bash
curl -X POST http://localhost:8081/v1/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Item","description":"Testing the API"}'
```

### Get All Items
```bash
curl http://localhost:8081/v1/items
```

### Get Item by ID (will cache it)
```bash
curl http://localhost:8081/v1/items/1
```

### Upload a File
```bash
curl -X POST http://localhost:8081/v1/files/upload \
  -F "file=@/path/to/your/file.txt"
```

### Check Service Status
```bash
curl http://localhost:8081/v1/status/services | python3 -m json.tool
```

### View Redis Cache
```bash
curl http://localhost:8081/v1/data/redis | python3 -m json.tool
docker compose -f docker-compose.yml -f docker-compose.override.yml up -d
```

## Project Structure

```
├── app/                    # Spring Boot backend
│   ├── src/main/java/      # Java source code
│   ├── src/main/resources/ # Config and Flyway migrations
│   ├── pom.xml            # Maven dependencies
│   └── Dockerfile         # Multi-stage build
├── worker/                # Spring Boot event consumer
│   ├── src/main/java/     # Worker source code
│   ├── pom.xml           # Maven config
│   └── Dockerfile        # Worker container
├── frontend/              # React frontend
│   ├── src/              # React components
│   ├── package.json      # NPM dependencies
│   └── Dockerfile        # Vite build + Nginx
├── docker-compose.yml     # Local orchestration
└── README.md             # This file
```

## Database Schema

Flyway migrations in `app/src/main/resources/db/migration/`:
- `V1__create_items.sql` - Creates items table with id, name, description, created_at
- Worker creates `derived` table for processed event logs

## Environment Variables

All services use container networking by default. Key environment variables:
- `SPRING_DATASOURCE_URL` - PostgreSQL connection
- `REDIS_HOST` - Redis hostname  
- `RABBITMQ_HOST` - RabbitMQ hostname
- `MINIO_ENDPOINT` - MinIO S3 endpoint

## Next Steps

This local setup provides the foundation for:
1. **GCP Migration** - Deploy to GKE with Cloud SQL, MemoryStore, Pub/Sub
2. **Infrastructure as Code** - Terraform for VPC, firewalls, managed services
3. **CI/CD Pipeline** - GitHub Actions or Cloud Build
4. **Production Features** - Load balancing, monitoring, security policies

## Troubleshooting

```bash
# Rebuild specific service
docker compose build backend && docker compose up -d backend

# Clean restart
docker compose down && docker compose up --build -d

# View detailed logs
docker compose logs -f backend
```

---

## 🔧 Manual Setup (Alternative to Scripts)

If you prefer manual setup:

```bash
# 1. Ensure Docker and Docker Compose are installed
docker --version
docker compose version

# 2. Build and start all services
docker-compose build
docker-compose up -d

# 3. Wait for services to initialize (~30 seconds)
docker-compose logs -f backend

# 4. Access the application at http://localhost:3001
```

---

## 🛠️ Useful Commands

### Service Management
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose stop

# Restart a specific service
docker-compose restart backend

# View logs
docker-compose logs -f                    # All services
docker-compose logs -f backend            # Specific service

# Check service status
docker-compose ps

# Remove all containers and volumes
docker-compose down -v
```

### Database Operations
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U demo -d demo

# Connect to Redis CLI
docker-compose exec redis redis-cli

# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL
```

---

## 🐛 Troubleshooting

### Services Not Starting
```bash
# View detailed error logs
docker-compose logs backend

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Redis Connection Issues
```bash
# Verify Redis is running
docker-compose exec redis redis-cli ping

# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL
```

---

## 📞 Support

If you encounter issues:
1. Check logs: `docker-compose logs -f`
2. Restart services: `docker-compose restart`
3. Clean rebuild: `docker-compose down -v && docker-compose up -d`

**Happy coding! 🎉**
