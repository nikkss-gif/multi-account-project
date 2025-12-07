# Quick Start - For Users With Nothing Installed

## 🚀 One-Command Setup

### Step 1: Extract the Project
Extract the ZIP file you received to any folder.

### Step 2: Run the Installer
Open terminal in the extracted folder and run:

```bash
chmod +x install.sh && ./install.sh
```

### Step 3: Follow the Prompts
The script will automatically:
- ✅ Install Docker & Docker Compose
- ✅ Build all services
- ✅ **If 401 error occurs**: Prompt you to login to Docker Hub
- ✅ **Auto-retry**: After login, automatically retry the build
- ✅ Start the application
- ✅ Verify everything works

**You don't need to run the script multiple times!** It handles everything in one go.

### Step 4: Access the Application
Once complete, open your browser:
```
http://localhost:3001
```

---

## ⚠️ What if I see "401 Unauthorized"?

**Don't panic!** The script will handle this automatically:

1. **If you have a Docker Hub account:**
   - Script will ask: "Do you want to login to Docker Hub now?"
   - Type `y` and press Enter
   - Enter your Docker Hub username and password
   - Script automatically retries the build
   - ✅ Done!

2. **If you don't have an account:**
   - Type `n` when prompted
   - Create FREE account at https://hub.docker.com/signup (takes 2 minutes)
   - Run the script again: `./install.sh`
   - Next time, login when prompted
   - ✅ Done!

**The script does NOT exit on 401 errors!** It gives you a chance to login and continues automatically.

---

## 📋 System Requirements

- **OS:** Ubuntu 20.04+ / Debian 10+ / Any modern Linux
- **Memory:** 4GB RAM minimum (8GB recommended)
- **Disk:** 10GB free space
- **Internet:** Required for first-time setup

---

## 🛑 Stop the Application

```bash
./stop.sh
```

Or manually:
```bash
docker compose down
```

---

## 🔄 Restart the Application

```bash
./start.sh
```

Or manually:
```bash
docker compose up -d
```

---

## 📚 Full Documentation

- **TROUBLESHOOTING.md** - Common issues and solutions
- **README.md** - Complete technical documentation
- **DASHBOARD.md** - Using the application dashboard

---

## 🆘 Need Help?

1. Check **TROUBLESHOOTING.md** first
2. View logs: `docker compose logs`
3. Check service status: `docker compose ps`

---

## That's It! 🎉

The installer handles everything. You don't need any technical knowledge!
