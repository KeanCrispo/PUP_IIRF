#!/bin/bash

set -e

echo "=========================================="
echo "Face Recognition System - Setup"
echo "=========================================="
echo ""

# Check if running on Raspberry Pi
if ! grep -q "Raspberry Pi" /proc/device-tree/model 2>/dev/null; then
    echo "Warning: This script is designed for Raspberry Pi"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Update system
echo "[1/7] Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install system dependencies
echo "[2/7] Installing system dependencies..."
sudo apt install -y \
    python3-pip \
    python3-venv \
    python3-dev \
    cmake \
    build-essential \
    libopencv-dev \
    python3-opencv \
    libatlas-base-dev \
    libjpeg-dev \
    libpng-dev \
    libavcodec-dev \
    libavformat-dev \
    libswscale-dev \
    libv4l-dev \
    libxvidcore-dev \
    libx264-dev

# Create virtual environment
echo "[3/7] Creating Python virtual environment..."
python3 -m venv ~/face_recognition_env
source ~/face_recognition_env/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install Python packages
echo "[4/7] Installing Python packages (this may take 15-30 minutes)..."
pip install -r requirements.txt

# Add user to video group
echo "[5/7] Adding user to video group..."
sudo usermod -a -G video $USER

# Setup systemd service
echo "[6/7] Setting up systemd service..."
API_URL="https://face-recognition-system-d34lg8c82vjsu683vkqg.lp.dev"
USER_HOME=$(eval echo ~$USER)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Create service file
sudo tee /etc/systemd/system/face-recognition.service > /dev/null <<EOF
[Unit]
Description=Face Recognition System
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$SCRIPT_DIR
Environment="API_URL=$API_URL"
Environment="PATH=$USER_HOME/face_recognition_env/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=$USER_HOME/face_recognition_env/bin/python3 $SCRIPT_DIR/face_recognition_client.py
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable face-recognition.service

# Make scripts executable
echo "[7/7] Setting permissions..."
chmod +x camera_test.py
chmod +x face_recognition_client.py
chmod +x optimize_performance.py

echo ""
echo "=========================================="
echo "Installation Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Logout and login again (for video group to take effect)"
echo "2. Test camera: python3 camera_test.py"
echo "3. Run face recognition: python3 face_recognition_client.py"
echo "4. Start service: sudo systemctl start face-recognition"
echo "5. Check status: sudo systemctl status face-recognition"
echo ""
echo "Optional: Run optimize_performance.py for better performance"
echo "  sudo python3 optimize_performance.py"
echo ""
echo "API URL: $API_URL"
echo ""
