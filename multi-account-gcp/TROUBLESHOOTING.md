# Troubleshooting Guide

## ❌ Docker Hub 401 Unauthorized Error

**Most Common Issue!** This error appears during installation:
```
failed to fetch oauth token: unexpected status from GET request to https://auth.docker.io/token... 401 Unauthorized: incorrect username or password
```

### ✅ Solution 1: Login to Docker Hub (Recommended - Takes 2 Minutes)

Docker Hub limits anonymous users to 100 pulls per 6 hours. Your build needs multiple base images which can exceed this limit.

**Step-by-step fix:**

1. **Create a FREE Docker Hub account**  
   Go to: https://hub.docker.com/signup

2. **Login from terminal**
   ```bash
   docker login
   ```
   
3. **Enter credentials**
   - Username: your_docker_hub_username
   - Password: your_docker_hub_password

4. **Run installer again**
   ```bash
   ./install.sh
   ```

**That's it!** ✅ With a free account, you get 200 pulls per 6 hours (more than enough).

---

### 🔑 Solution 2: Use Docker Hub Access Token (Alternative)

If you already have a Docker Hub account:

1. Go to: https://hub.docker.com/settings/security
2. Click "New Access Token"
3. Give it a name (e.g., "my-laptop")
4. Copy the token
5. Login:
   ```bash
   docker login -u YOUR_USERNAME
   ```
6. Paste the token when asked for password
7. Run: `./install.sh`

---

### ⏰ Solution 3: Wait for Rate Limit Reset

If you don't want to create an account:

1. Wait 10-30 minutes
2. Run `./install.sh` again

Docker Hub rate limits reset after 6 hours, but sometimes waiting a short time helps.

---

## ❌ Cannot Access Docker Hub / Network Error

If you see:
```
Cannot access Docker Hub. Please check your internet connection.
```

### ✅ Check Internet Connection

```bash
# Test general internet
ping -c 4 google.com

# Test Docker Hub specifically
ping -c 4 hub.docker.com

# Test DNS resolution
nslookup hub.docker.com
```

### ✅ Check Docker Daemon

```bash
# Check if Docker is running
sudo systemctl status docker

# Restart Docker if needed
sudo systemctl restart docker

# Try pulling an image manually
docker pull hello-world:latest
```

### ✅ Proxy Configuration

If you're behind a corporate proxy:

1. Create/edit: `/etc/systemd/system/docker.service.d/http-proxy.conf`
   ```ini
   [Service]
   Environment="HTTP_PROXY=http://proxy.example.com:8080"
   Environment="HTTPS_PROXY=http://proxy.example.com:8080"
   Environment="NO_PROXY=localhost,127.0.0.1"
   ```

2. Reload and restart:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl restart docker
   ```

---

## ❌ Permission Denied Error

If you see "permission denied" errors:
```bash
sudo usermod -aG docker $USER
newgrp docker
./install.sh
```

### Port Already in Use

If ports 3001, 8081, 5432, etc. are already in use:
```bash
# Find what's using the port
sudo lsof -i :3001

# Stop the conflicting service or change ports in docker-compose.yml
```

### Services Not Starting

Check logs for specific service:
```bash
docker compose logs backend
docker compose logs frontend
docker compose logs postgres
```

### Out of Disk Space

Check available space:
```bash
df -h
```

Clean up Docker:
```bash
docker system prune -a
```

---

## Getting Help

If none of these solutions work:

1. Check the logs:
   ```bash
   cd /path/to/multi-account-gcp
   docker compose logs
   ```

2. Take a screenshot of the error
3. Share the error message and system info:
   ```bash
   docker version
   docker compose version
   uname -a
   ```
