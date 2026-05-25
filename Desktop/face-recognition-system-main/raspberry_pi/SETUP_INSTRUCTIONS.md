# Raspberry Pi Face Recognition Setup Instructions

## Complete Setup Guide for Raspberry Pi 5 Integration

This guide will help you set up your Raspberry Pi 5 to work with the Face Recognition System backend.

---

## 📋 Prerequisites

### Hardware Requirements
- **Raspberry Pi 5** (4GB or 8GB RAM recommended)
- **Camera Module V3** (or compatible USB camera)
- **MicroSD Card** (32GB Class 10 or better)
- **Power Supply** (5V/3A official Raspberry Pi power supply)
- **Cooling Solution** (heatsink or active cooling fan)

### Software Requirements
- **Raspberry Pi OS** (64-bit, Bullseye or newer)
- **Internet Connection** for downloading packages

---

## 🚀 Quick Installation

### Step 1: Download the Project Files

Transfer the `raspberry_pi` folder to your Raspberry Pi:

```bash
# If using git
git clone <repository-url>
cd face-recognition-system/raspberry_pi

# Or if files are already on your Pi
cd /path/to/raspberry_pi
```

### Step 2: Run the Installation Script

```bash
chmod +x install.sh
./install.sh
```

The installation will:
1. Update system packages
2. Install all dependencies (OpenCV, dlib, face_recognition)
3. Create Python virtual environment
4. Install Python packages
5. Add user to video group
6. Set up systemd service for auto-start
7. Make scripts executable

**Note:** Installation may take 15-30 minutes, especially for dlib compilation.

### Step 3: Logout and Login

After installation, logout and login again for the video group membership to take effect:

```bash
logout
```

---

## 🧪 Testing the Setup

### Test Camera

```bash
cd /path/to/raspberry_pi
python3 camera_test.py
```

This will:
- Check camera permissions
- Test camera initialization
- Capture test frames
- Save a test image

### Test Face Recognition

```bash
python3 face_recognition_client.py
```

This will:
- Connect to the backend API
- Load known faces from the database
- Start real-time face recognition
- Display live camera feed with detections

**Controls:**
- Press `q` to quit
- Press `r` to reload faces from backend

---

## ⚙️ Configuration

### Update API URL

If your backend URL is different, update it in the service file:

```bash
sudo nano /etc/systemd/system/face-recognition.service
```

Change the `API_URL` environment variable:

```
Environment="API_URL=https://your-backend-url.com"
```

Then reload:

```bash
sudo systemctl daemon-reload
sudo systemctl restart face-recognition
```

Or set it as an environment variable before running:

```bash
export API_URL=https://your-backend-url.com
python3 face_recognition_client.py
```

---

## 🔧 Running the System

### Manual Start

```bash
cd /path/to/raspberry_pi
source ~/face_recognition_env/bin/activate
python3 face_recognition_client.py
```

### Service Management

**Start the service:**
```bash
sudo systemctl start face-recognition
```

**Stop the service:**
```bash
sudo systemctl stop face-recognition
```

**Check status:**
```bash
sudo systemctl status face-recognition
```

**Enable auto-start on boot:**
```bash
sudo systemctl enable face-recognition
```

**Disable auto-start:**
```bash
sudo systemctl disable face-recognition
```

**View logs:**
```bash
sudo journalctl -u face-recognition -f
```

---

## 🎯 Performance Optimization

Run the optimization script for better performance:

```bash
sudo python3 optimize_performance.py
```

This will:
- Optimize GPU memory allocation
- Enable camera module
- Set CPU governor to performance mode
- Optimize swap settings
- Install monitoring tools

---

## 📸 How It Works

### 1. **Face Loading**
- The script connects to your backend API
- Downloads all member profiles with their trained face images
- Generates face encodings for recognition

### 2. **Real-time Detection**
- Captures video from Raspberry Pi camera
- Processes frames for face detection
- Compares detected faces with known encodings
- Sends detections to backend API

### 3. **Data Synchronization**
- All detections are stored in the backend database
- Images are uploaded to Object Storage
- Data is accessible from any device connected to the backend
- Real-time updates across all clients

### 4. **Detection Cooldown**
- 5-second cooldown per person to avoid duplicate detections
- Efficient processing (every 2nd frame)
- Optimized for Raspberry Pi performance

---

## 🔍 Troubleshooting

### Camera Not Detected

1. **Check camera connection:**
   ```bash
   vcgencmd get_camera
   ```
   Should show: `supported=1 detected=1`

2. **Enable camera interface:**
   ```bash
   sudo raspi-config
   ```
   Navigate to: `Interface Options > Camera > Enable`

3. **Check video devices:**
   ```bash
   ls -l /dev/video*
   ```

### Permission Denied

Add user to video group:
```bash
sudo usermod -a -G video $USER
```
Then logout and login again.

### Face Recognition Not Working

1. **Check API connection:**
   ```bash
   curl https://face-recognition-system-d34lg8c82vjsu683vkqg.lp.dev/api/members
   ```

2. **Verify face images exist in backend:**
   - Login to web interface
   - Go to Members page
   - Ensure members have face images uploaded

3. **Reload faces:**
   - While running, press `r` to reload faces from backend

### Performance Issues

1. **Check temperature:**
   ```bash
   vcgencmd measure_temp
   ```
   Ensure adequate cooling if >60°C

2. **Monitor CPU usage:**
   ```bash
   htop
   ```

3. **Run optimization script:**
   ```bash
   sudo python3 optimize_performance.py
   ```

### Service Not Starting

1. **Check service status:**
   ```bash
   sudo systemctl status face-recognition
   ```

2. **View detailed logs:**
   ```bash
   sudo journalctl -u face-recognition -n 50
   ```

3. **Verify paths in service file:**
   ```bash
   cat /etc/systemd/system/face-recognition.service
   ```

---

## 📊 Monitoring

### View Real-time Logs

```bash
sudo journalctl -u face-recognition -f
```

### Check System Resources

```bash
htop
```

### Monitor Temperature

```bash
watch -n 1 vcgencmd measure_temp
```

---

## 🔐 Security Notes

- The API URL is embedded in the service file
- All communication uses HTTPS
- Images are stored securely in Object Storage
- Consider using VPN for remote access
- Regularly update system packages

---

## 📁 File Structure

```
raspberry_pi/
├── face_recognition_client.py  # Main face recognition script
├── camera_test.py              # Camera testing utility
├── optimize_performance.py     # Performance optimization
├── install.sh                  # Installation script
├── requirements.txt            # Python dependencies
├── face-recognition.service    # Systemd service template
├── README.md                   # Hardware documentation
└── SETUP_INSTRUCTIONS.md       # This file
```

---

## 🌐 Accessing the Web Interface

Once your Raspberry Pi is running, you can access the web interface from:

1. **Same network:** `http://<raspberry-pi-ip>:5000`
2. **Any device:** `https://face-recognition-system-d34lg8c82vjsu683vkqg.lp.dev`

All data (members, detections, images) is synchronized via the backend API and Object Storage.

---

## 🎉 Success!

If everything is working:
- ✅ Camera is detected and working
- ✅ Face recognition is running
- ✅ Detections appear in web interface
- ✅ Images are visible on any device

You're all set! The system will:
- Auto-start on boot
- Detect known and unknown faces
- Send detections to backend
- Store images in Object Storage
- Provide real-time updates to all clients

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review system logs: `sudo journalctl -u face-recognition -n 100`
3. Verify API connectivity: `curl https://face-recognition-system-d34lg8c82vjsu683vkqg.lp.dev/api/stats`

---

**Current API URL:** `https://face-recognition-system-d34lg8c82vjsu683vkqg.lp.dev`

**Project ID:** `proj_d34lg8c82vjsu683vkqg`
