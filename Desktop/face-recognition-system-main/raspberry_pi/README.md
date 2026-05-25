# Face Recognition System for Raspberry Pi 5

A comprehensive multi-face recognition and capture system optimized for Raspberry Pi 5 with Camera Module V3.

## Features

- Real-time face recognition with high accuracy
- Web-based management interface
- Voice greetings for recognized members
- Member management with multiple face images
- Detection history and notifications
- Responsive modern UI with animations
- Auto-start on boot
- Performance optimized for Raspberry Pi 5

## Hardware Requirements

- Raspberry Pi 5 (4GB or 8GB recommended)
- Camera Module V3 (or compatible USB camera)
- Speaker or audio output device
- MicroSD card (32GB Class 10 or better)
- Adequate cooling solution
- 5V/3A power supply

## Software Requirements

- Raspberry Pi OS (64-bit recommended)
- Python 3.8+
- OpenCV 4.x
- dlib
- face_recognition library

## Installation

### Quick Installation

1. Clone or download the project files to your Raspberry Pi
2. Run the installation script:
```bash
chmod +x install.sh
./install.sh
```

3. Reboot the system:
```bash
sudo reboot
```

4. Access the web interface at `http://localhost:5000`

### Manual Installation

If the automatic installation fails, follow these steps:

1. Update your system:
```bash
sudo apt update && sudo apt upgrade -y
```

2. Install dependencies:
```bash
sudo apt install -y python3-pip python3-venv cmake build-essential
sudo apt install -y libopencv-dev python3-opencv libatlas-base-dev
sudo apt install -y espeak espeak-data festival
```

3. Create virtual environment:
```bash
python3 -m venv face_recognition_env
source face_recognition_env/bin/activate
```

4. Install Python packages:
```bash
pip install -r requirements.txt
```

5. Run the application:
```bash
cd backend
python app.py
```

## Performance Optimization

Run the performance optimization script for better performance:

```bash
sudo python3 optimize_performance.py
```

This will:
- Optimize GPU memory allocation
- Enable camera module
- Set CPU governor to performance mode
- Optimize swap settings
- Install monitoring tools

## Testing

Test your camera setup:

```bash
python3 camera_test.py
```

Monitor system performance:

```bash
./performance_monitor.sh
```

## Usage

### First Time Setup

1. Open web browser and navigate to `http://localhost:5000`
2. Login with default credentials:
   - Username: `admin`
   - Password: `admin`
3. Change admin credentials in Settings
4. Add members with their face images
5. Start the camera for real-time recognition

### Adding Members

1. Go to the Members page
2. Click "Add Member"
3. Enter member name
4. Upload profile image or capture with camera
5. Add multiple face images for better recognition
6. Save the member

### Face Recognition

1. Go to Dashboard
2. Click the camera toggle to start recognition
3. The system will automatically detect and recognize faces
4. Known members will receive voice greetings
5. All detections are logged in History

### Monitoring

- **Dashboard**: View real-time stats and camera feed
- **History**: Browse all face detections with images
- **Notifications**: Real-time alerts for new detections
- **Settings**: Configure system preferences

## Configuration

### Camera Settings

The system automatically configures the camera for optimal performance:
- Resolution: 1280x720 (adjustable)
- Frame rate: 30 FPS
- Buffer size: 1 frame for low latency

### Recognition Settings

- Face detection tolerance: 0.6 (adjustable in code)
- Detection cooldown: 5 seconds per person
- Processing: Every other frame for performance

### Audio Settings

Voice greetings use the system's default audio output. Configure audio:

```bash
# Test audio
speaker-test -t wav -c 2

# Set audio output (if needed)
sudo raspi-config
# Navigate to Advanced Options > Audio
```

## Troubleshooting

### Camera Issues

1. Check camera connection:
```bash
vcgencmd get_camera
```

2. Test camera:
```bash
python3 camera_test.py
```

3. Enable camera in raspi-config:
```bash
sudo raspi-config
# Interface Options > Camera > Enable
```

### Permission Issues

Add user to video group:
```bash
sudo usermod -a -G video $USER
# Logout and login again
```

### Performance Issues

1. Check system temperature:
```bash
vcgencmd measure_temp
```

2. Monitor CPU usage:
```bash
htop
```

3. Ensure adequate cooling and power supply

### Memory Issues

1. Increase GPU memory split:
```bash
sudo raspi-config
# Advanced Options > Memory Split > 128
```

2. Monitor memory usage:
```bash
free -h
```

## File Structure

```
face_recognition_system/
├── frontend/
│   ├── index.html          # Main web interface
│   ├── styles.css          # UI styling
│   └── script.js           # Frontend JavaScript
├── backend/
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   └── face_recognition.db # SQLite database
├── raspberry_pi/
│   ├── install.sh          # Installation script
│   ├── camera_test.py      # Camera testing
│   ├── optimize_performance.py # Performance optimization
│   └── README.md           # This file
└── detections/             # Stored detection images
```

## API Endpoints

- `GET /api/members` - Get all members
- `POST /api/members` - Add new member
- `DELETE /api/members/{id}` - Delete member
- `POST /api/camera/start` - Start camera
- `POST /api/camera/stop` - Stop camera
- `GET /api/detections` - Get detection history
- `GET /api/notifications` - Get notifications
- `GET /api/stats` - Get dashboard statistics

## Security Notes

- Change default admin password
- Use HTTPS in production
- Restrict network access if needed
- Regular security updates
- Secure physical access to device

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly on