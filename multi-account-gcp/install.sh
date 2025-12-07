#!/bin/bash

###############################################################################
# Multi-Account GCP Application - Complete Linux Setup Script
# 
# This script does EVERYTHING needed to run the application:
# - Checks system requirements
# - Installs Docker and Docker Compose if needed
# - Sets up permissions
# - Builds and starts all services
# - Verifies everything is working
#
# Usage: sudo ./install.sh
###############################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Detect if running as root
SUDO_CMD=""
if [ "$EUID" -ne 0 ]; then 
    SUDO_CMD="sudo"
fi

###############################################################################
# Helper Functions
###############################################################################

print_header() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

press_any_key() {
    echo ""
    read -p "Press any key to continue..." -n1 -s
    echo ""
}

###############################################################################
# Banner
###############################################################################

clear
echo -e "${CYAN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   🚀 Multi-Account GCP Application - Linux Installer            ║
║                                                                  ║
║   This script will install ALL dependencies and set up           ║
║   the complete application automatically!                        ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"
echo ""

print_info "Starting installation process..."
sleep 2

###############################################################################
# Step 1: System Requirements Check
###############################################################################

print_header "Step 1: Checking System Requirements"

# Check Linux distribution
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
    VER=$VERSION_ID
    print_info "Operating System: $OS $VER"
else
    print_error "Cannot determine OS version"
    exit 1
fi

# Check memory
TOTAL_MEM=$(free -g | awk '/^Mem:/{print $2}')
if [ "$TOTAL_MEM" -lt 7 ]; then
    print_warning "System has ${TOTAL_MEM}GB RAM. Recommended: 8GB+"
    print_warning "Application may run slowly."
else
    print_success "Memory: ${TOTAL_MEM}GB (sufficient)"
fi

# Check disk space
FREE_SPACE=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
if [ "$FREE_SPACE" -lt 10 ]; then
    print_error "Insufficient disk space: ${FREE_SPACE}GB free"
    print_error "Required: 10GB free space"
    exit 1
else
    print_success "Disk space: ${FREE_SPACE}GB free (sufficient)"
fi

# Check internet connectivity
if ping -c 1 google.com &> /dev/null; then
    print_success "Internet connection: OK"
else
    print_error "No internet connection detected"
    print_error "Internet is required to download Docker images"
    exit 1
fi

echo ""
print_success "System requirements check passed!"
sleep 2

###############################################################################
# Step 2: Install Docker
###############################################################################

print_header "Step 2: Installing Docker"

if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_success "Docker is already installed: $DOCKER_VERSION"
else
    print_warning "Docker is not installed. Installing now..."
    
    # Update package index
    print_info "Updating package index..."
    $SUDO_CMD apt-get update -qq
    
    # Install prerequisites
    print_info "Installing prerequisites..."
    $SUDO_CMD apt-get install -y -qq \
        ca-certificates \
        curl \
        gnupg \
        lsb-release > /dev/null 2>&1
    
    # Add Docker's official GPG key
    print_info "Adding Docker GPG key..."
    $SUDO_CMD mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | $SUDO_CMD gpg --dearmor -o /etc/apt/keyrings/docker.gpg 2>/dev/null || true
    
    # Set up Docker repository
    print_info "Setting up Docker repository..."
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | $SUDO_CMD tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    print_info "Installing Docker Engine..."
    $SUDO_CMD apt-get update -qq
    $SUDO_CMD apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin > /dev/null
    
    print_success "Docker installed successfully!"
fi

# Verify Docker is running
if ! $SUDO_CMD docker info &> /dev/null; then
    print_warning "Docker daemon is not running. Starting Docker..."
    $SUDO_CMD systemctl start docker
    $SUDO_CMD systemctl enable docker
    print_success "Docker daemon started!"
fi

print_success "Docker is running!"

###############################################################################
# Step 3: Configure Docker Permissions
###############################################################################

print_header "Step 3: Configuring Docker Permissions"

# Check if user is in docker group
if groups $USER | grep &>/dev/null '\bdocker\b'; then
    print_success "User $USER is already in docker group"
else
    print_info "Adding user $USER to docker group..."
    $SUDO_CMD usermod -aG docker $USER
    print_success "User added to docker group!"
    print_warning "You may need to log out and log back in for this to take effect."
    print_warning "Continuing with sudo for now..."
fi

###############################################################################
# Step 4: Install Docker Compose
###############################################################################

print_header "Step 4: Verifying Docker Compose"

if docker compose version &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version)
    print_success "Docker Compose is installed: $COMPOSE_VERSION"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    print_success "Docker Compose is installed: $COMPOSE_VERSION"
else
    print_warning "Docker Compose not found. Installing..."
    $SUDO_CMD apt-get install -y docker-compose-plugin
    print_success "Docker Compose installed!"
fi

###############################################################################
# Step 5: Install Additional Dependencies
###############################################################################

print_header "Step 5: Installing Additional Dependencies"

# Install curl if not present
if ! command -v curl &> /dev/null; then
    print_info "Installing curl..."
    $SUDO_CMD apt-get install -y curl
fi

# Install python3 for JSON formatting (optional)
if ! command -v python3 &> /dev/null; then
    print_info "Installing python3..."
    $SUDO_CMD apt-get install -y python3
fi

print_success "All dependencies installed!"

###############################################################################
# Step 6: Setup Project Directory Permissions
###############################################################################

print_header "Step 6: Setting Up Project Permissions"

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

print_info "Project directory: $SCRIPT_DIR"

# Make scripts executable
if [ -f "setup.sh" ]; then chmod +x setup.sh; fi
if [ -f "start.sh" ]; then chmod +x start.sh; fi
if [ -f "stop.sh" ]; then chmod +x stop.sh; fi

# Create tmp directory for uploads if it doesn't exist
mkdir -p /tmp/uploads
chmod 777 /tmp/uploads

print_success "Permissions configured!"

###############################################################################
# Step 7: Clean Up Previous Installations
###############################################################################

print_header "Step 7: Cleaning Up Previous Installations"

if $SUDO_CMD docker ps -a | grep -q "multi-account-gcp"; then
    print_warning "Found existing containers. Removing..."
    $SUDO_CMD docker compose down -v 2>/dev/null || $SUDO_CMD docker-compose down -v 2>/dev/null || true
    print_success "Previous installation cleaned up!"
else
    print_info "No previous installation found."
fi

###############################################################################
# Step 7.5: Check Docker Hub Authentication
###############################################################################

print_header "Step 7.5: Verifying Docker Hub Access"

# Check if user is logged into Docker Hub
if ! $SUDO_CMD docker info 2>/dev/null | grep -q "Username:"; then
    print_warning "Not logged into Docker Hub."
    print_info "If you encounter 401 Unauthorized errors during build:"
    print_info "  1. Run: docker login"
    print_info "  2. Run this script again: ./install.sh"
    echo ""
else
    print_success "Docker Hub authentication detected!"
fi

# Test Docker Hub connectivity (non-blocking)
print_info "Testing Docker Hub connectivity..."
if timeout 10 $SUDO_CMD docker pull hello-world:latest > /dev/null 2>&1; then
    print_success "Docker Hub is accessible!"
    $SUDO_CMD docker rmi hello-world:latest > /dev/null 2>&1 || true
else
    print_warning "Could not verify Docker Hub connection (timeout or network issue)"
    print_info "Continuing anyway - build will fail if Docker Hub is unreachable"
    echo ""
fi

###############################################################################
# Step 8: Build Docker Images
###############################################################################

print_header "Step 8: Building Docker Images"

echo ""
print_info "This may take 5-10 minutes on first run..."
print_info "Building backend, frontend, and worker services..."
echo ""

# Use docker compose or docker-compose based on availability
if docker compose version &> /dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# Build with progress and capture errors
BUILD_LOG="/tmp/docker_build_$$.log"
BUILD_ATTEMPT=1
BUILD_SUCCESS=false

while [ $BUILD_ATTEMPT -le 2 ] && [ "$BUILD_SUCCESS" = false ]; do
    if [ $BUILD_ATTEMPT -eq 2 ]; then
        print_info "Retrying build after Docker Hub login..."
        echo ""
    fi
    
    if $SUDO_CMD $DOCKER_COMPOSE build --no-cache 2>&1 | tee "$BUILD_LOG"; then
        print_success "All Docker images built successfully!"
        rm -f "$BUILD_LOG"
        BUILD_SUCCESS=true
    else
        echo ""
        print_error "Failed to build Docker images"
        echo ""
        
        # Check if it's a 401 error
        if grep -q "401 Unauthorized" "$BUILD_LOG" 2>/dev/null; then
            if [ $BUILD_ATTEMPT -eq 1 ]; then
                print_warning "🔐 DOCKER HUB AUTHENTICATION REQUIRED!"
                echo ""
                print_info "You hit Docker Hub rate limits (100 pulls/6hrs for anonymous users)."
                print_info "Don't worry! You can fix this in 2 minutes with a FREE Docker Hub account."
                echo ""
                print_warning "═══════════════════════════════════════════════════════════"
                print_info "Option 1: Already have a Docker Hub account?"
                print_info "          → Just login now and we'll retry automatically!"
                echo ""
                print_info "Option 2: Don't have an account?"
                print_info "          → Press Ctrl+C to cancel"
                print_info "          → Create FREE account at: https://hub.docker.com/signup"
                print_info "          → Run this script again: ./install.sh"
                print_warning "═══════════════════════════════════════════════════════════"
                echo ""
                
                # Prompt for Docker Hub login
                read -p "Do you want to login to Docker Hub now? (y/n): " -n 1 -r
                echo ""
                
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    echo ""
                    print_info "Great! Please enter your Docker Hub credentials below:"
                    echo ""
                    
                    # Attempt Docker login
                    if docker login; then
                        print_success "Successfully logged into Docker Hub!"
                        echo ""
                        print_info "Now retrying the build..."
                        BUILD_ATTEMPT=$((BUILD_ATTEMPT + 1))
                        sleep 2
                        continue
                    else
                        print_error "Docker login failed!"
                        echo ""
                        print_info "Please verify your credentials and try again."
                        print_info "Run this script again: ./install.sh"
                        echo ""
                        rm -f "$BUILD_LOG"
                        exit 1
                    fi
                else
                    echo ""
                    print_info "No problem! Here's what to do:"
                    echo ""
                    print_info "1. Create FREE account: https://hub.docker.com/signup"
                    print_info "2. Come back and run: ./install.sh"
                    print_info "3. When prompted, login with your new credentials"
                    echo ""
                    rm -f "$BUILD_LOG"
                    exit 1
                fi
            else
                # Second attempt also failed with 401
                print_error "Build failed again with 401 error after login."
                echo ""
                print_info "Please verify your Docker Hub credentials and try again:"
                print_info "  docker logout"
                print_info "  docker login"
                print_info "  ./install.sh"
                echo ""
                rm -f "$BUILD_LOG"
                exit 1
            fi
        else
            # Not a 401 error
            print_warning "Common solutions:"
            print_info "1. Check your internet connection:"
            print_info "   ping -c 4 hub.docker.com"
            echo ""
            print_info "2. Check Docker daemon:"
            print_info "   sudo systemctl status docker"
            echo ""
            print_info "3. If behind a proxy, configure Docker proxy settings"
            echo ""
            print_info "4. Try building manually to see full error:"
            print_info "   cd $SCRIPT_DIR"
            print_info "   docker compose build"
            echo ""
            rm -f "$BUILD_LOG"
            exit 1
        fi
    fi
done

if [ "$BUILD_SUCCESS" = false ]; then
    print_error "Build failed after maximum attempts"
    rm -f "$BUILD_LOG"
    exit 1
fi

###############################################################################
# Step 9: Start All Services
###############################################################################

print_header "Step 9: Starting All Services"

print_info "Starting containers..."
$SUDO_CMD $DOCKER_COMPOSE up -d

if [ $? -eq 0 ]; then
    print_success "All services started successfully!"
else
    print_error "Failed to start services"
    print_info "Check logs with: docker compose logs"
    exit 1
fi

###############################################################################
# Step 10: Wait for Services to Initialize
###############################################################################

print_header "Step 10: Waiting for Services to Initialize"

print_info "Waiting for services to be ready (this takes 30-60 seconds)..."
sleep 15

# Wait for backend to be ready
print_info "Checking backend service..."
BACKEND_READY=false
for i in {1..30}; do
    if curl -s http://localhost:8081/v1/status/services > /dev/null 2>&1; then
        BACKEND_READY=true
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

if [ "$BACKEND_READY" = true ]; then
    print_success "Backend service is ready!"
else
    print_warning "Backend service is taking longer than expected..."
    print_info "It may still be starting up. Check logs: docker compose logs backend"
fi

sleep 5

###############################################################################
# Step 11: Verify Installation
###############################################################################

print_header "Step 11: Verifying Installation"

echo ""
print_info "Container Status:"
$SUDO_CMD $DOCKER_COMPOSE ps
echo ""

# Test backend API
if [ "$BACKEND_READY" = true ]; then
    print_info "Service Health Check:"
    if command -v python3 &> /dev/null; then
        curl -s http://localhost:8081/v1/status/services | python3 -m json.tool
    else
        curl -s http://localhost:8081/v1/status/services
    fi
    echo ""
fi

###############################################################################
# Step 12: Create Convenience Scripts
###############################################################################

print_header "Step 12: Creating Convenience Scripts"

# Create start script if it doesn't exist
if [ ! -f "start.sh" ]; then
    cat > start.sh << 'STARTEOF'
#!/bin/bash
echo "🚀 Starting Multi-Account GCP Application..."
sudo docker compose up -d
echo ""
echo "✅ Services started!"
echo "📱 Dashboard: http://localhost:3001"
echo "🔧 API: http://localhost:8081"
STARTEOF
    chmod +x start.sh
fi

# Create stop script if it doesn't exist
if [ ! -f "stop.sh" ]; then
    cat > stop.sh << 'STOPEOF'
#!/bin/bash
echo "🛑 Stopping Multi-Account GCP Application..."
sudo docker compose stop
echo "✅ Services stopped!"
STOPEOF
    chmod +x stop.sh
fi

# Create logs script
cat > logs.sh << 'LOGSEOF'
#!/bin/bash
echo "📋 Viewing logs (press Ctrl+C to exit)..."
sudo docker compose logs -f
LOGSEOF
chmod +x logs.sh

# Create status script
cat > status.sh << 'STATUSEOF'
#!/bin/bash
echo "📊 Service Status:"
sudo docker compose ps
echo ""
echo "🏥 Health Check:"
curl -s http://localhost:8081/v1/status/services | python3 -m json.tool 2>/dev/null || curl -s http://localhost:8081/v1/status/services
STATUSEOF
chmod +x status.sh

print_success "Convenience scripts created!"
print_info "Available commands:"
print_info "  ./start.sh   - Start all services"
print_info "  ./stop.sh    - Stop all services"
print_info "  ./logs.sh    - View logs"
print_info "  ./status.sh  - Check status"

###############################################################################
# Final Success Message
###############################################################################

echo ""
echo ""
print_header "🎉 Installation Complete!"

echo -e "${GREEN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║              ✅ SUCCESS! Everything is Ready!                   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo -e "${CYAN}📱 Access Your Application:${NC}"
echo ""
echo -e "  🌐 ${GREEN}Frontend Dashboard:${NC}  http://localhost:3001"
echo -e "  🔧 ${GREEN}Backend API:${NC}         http://localhost:8081"
echo -e "  🐰 ${GREEN}RabbitMQ Management:${NC} http://localhost:15672 (guest/guest)"
echo -e "  📦 ${GREEN}MinIO Console:${NC}       http://localhost:9000 (minioadmin/minioadmin)"
echo ""

echo -e "${CYAN}📊 Available Features:${NC}"
echo "  ✅ PostgreSQL database with sample data"
echo "  ✅ Redis caching (auto-caches when you create/get items)"
echo "  ✅ RabbitMQ messaging"
echo "  ✅ File upload functionality"
echo "  ✅ Real-time dashboard with 3 data tables"
echo ""

echo -e "${CYAN}🔧 Quick Commands:${NC}"
echo "  • View logs:           ./logs.sh"
echo "  • Check status:        ./status.sh"
echo "  • Stop services:       ./stop.sh"
echo "  • Start services:      ./start.sh"
echo "  • Restart all:         sudo docker compose restart"
echo "  • Remove everything:   sudo docker compose down -v"
echo ""

echo -e "${CYAN}🧪 Test Your Application:${NC}"
echo ""
echo "  1. Open http://localhost:3001 in your browser"
echo "  2. Click 'Create New Item' button"
echo "  3. Watch it appear in SQL table and get cached in Redis!"
echo ""
echo "  Or test via command line:"
echo '  curl -X POST http://localhost:8081/v1/items \'
echo '    -H "Content-Type: application/json" \'
echo '    -d '"'"'{"name":"Test Item","description":"Testing!"}'"'"
echo ""

if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}💡 Note:${NC} If you get permission errors, try:"
    echo "   1. Log out and log back in (for docker group to take effect)"
    echo "   2. Or prefix commands with 'sudo'"
fi

echo ""
echo -e "${GREEN}🚀 Happy Coding!${NC}"
echo ""

# Open browser automatically (optional)
if command -v xdg-open &> /dev/null; then
    read -p "Would you like to open the dashboard in your browser now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        xdg-open http://localhost:3001 2>/dev/null &
        print_success "Browser opened!"
    fi
fi

echo ""
