#!/usr/bin/env python3
"""
Performance optimization script for Raspberry Pi 5 face recognition
This script optimizes system settings for better performance
"""

import os
import subprocess
import sys

def optimize_gpu_memory():
    """Optimize GPU memory split"""
    print("Optimizing GPU memory split...")
    
    config_lines = []
    gpu_memory_set = False
    
    # Read current config
    try:
        with open('/boot/config.txt', 'r') as f:
            config_lines = f.readlines()
    except:
        config_lines = []
    
    # Update GPU memory setting
    new_config_lines = []
    for line in config_lines:
        if line.startswith('gpu_mem='):
            new_config_lines.append('gpu_mem=128\n')
            gpu_memory_set = True
        else:
            new_config_lines.append(line)
    
    # Add GPU memory setting if not found
    if not gpu_memory_set:
        new_config_lines.append('gpu_mem=128\n')
    
    # Write back config
    try:
        with open('/boot/config.txt', 'w') as f:
            f.writelines(new_config_lines)
        print("✓ GPU memory split set to 128MB")
    except Exception as e:
        print(f"✗ Failed to update GPU memory: {e}")

def optimize_camera_settings():
    """Optimize camera module settings"""
    print("Optimizing camera settings...")
    
    config_lines = []
    camera_enabled = False
    
    # Read current config
    try:
        with open('/boot/config.txt', 'r') as f:
            config_lines = f.readlines()
    except:
        config_lines = []
    
    # Check and add camera settings
    new_config_lines = []
    for line in config_lines:
        if line.startswith('camera_auto_detect='):
            new_config_lines.append('camera_auto_detect=1\n')
            camera_enabled = True
        elif line.startswith('start_x='):
            new_config_lines.append('start_x=1\n')
        else:
            new_config_lines.append(line)
    
    # Add camera settings if not found
    if not camera_enabled:
        new_config_lines.append('camera_auto_detect=1\n')
        new_config_lines.append('start_x=1\n')
    
    # Write back config
    try:
        with open('/boot/config.txt', 'w') as f:
            f.writelines(new_config_lines)
        print("✓ Camera module enabled")
    except Exception as e:
        print(f"✗ Failed to enable camera: {e}")

def optimize_cpu_governor():
    """Set CPU governor to performance mode"""
    print("Setting CPU governor to performance mode...")
    
    try:
        subprocess.run(['sudo', 'cpufreq-set', '-g', 'performance'], check=True)
        print("✓ CPU governor set to performance")
    except subprocess.CalledProcessError:
        try:
            # Alternative method
            with open('/sys/devices/system/cpu/cpu0/cpufreq/scaling_governor', 'w') as f:
                f.write('performance')
            print("✓ CPU governor set to performance (alternative method)")
        except Exception as e:
            print(f"✗ Failed to set CPU governor: {e}")

def optimize_swappiness():
    """Optimize swap usage"""
    print("Optimizing swap settings...")
    
    try:
        subprocess.run(['sudo', 'sysctl', 'vm.swappiness=10'], check=True)
        
        # Make permanent
        with open('/etc/sysctl.conf', 'a') as f:
            f.write('\n# Face recognition optimization\nvm.swappiness=10\n')
        
        print("✓ Swappiness set to 10")
    except Exception as e:
        print(f"✗ Failed to set swappiness: {e}")

def install_performance_tools():
    """Install performance monitoring tools"""
    print("Installing performance tools...")
    
    tools = ['htop', 'iotop', 'cpufrequtils']
    
    for tool in tools:
        try:
            subprocess.run(['sudo', 'apt', 'install', '-y', tool], 
                         check=True, capture_output=True)
            print(f"✓ Installed {tool}")
        except subprocess.CalledProcessError:
            print(f"✗ Failed to install {tool}")

def create_performance_script():
    """Create script to monitor performance"""
    script_content = '''#!/bin/bash
# Performance monitoring script for face recognition system

echo "=== Face Recognition System Performance Monitor ==="
echo "Date: $(date)"
echo ""

echo "=== CPU Information ==="
cat /proc/cpuinfo | grep "Model\|cpu cores\|cpu MHz" | head -10

echo ""
echo "=== Memory Usage ==="
free -h

echo ""
echo "=== CPU Usage ==="
top -bn1 | head -20

echo ""
echo "=== GPU Memory ==="
vcgencmd get_mem gpu

echo ""
echo "=== Temperature ==="
vcgencmd measure_temp

echo ""
echo "=== Camera Status ==="
vcgencmd get_camera

echo ""
echo "=== Disk Usage ==="
df -h

echo ""
echo "=== Running Processes ==="
ps aux | grep -E "(python|face)" | grep -v grep
'''

    try:
        with open('performance_monitor.sh', 'w') as f:
            f.write(script_content)
        os.chmod('performance_monitor.sh', 0o755)
        print("✓ Created performance_monitor.sh")
    except Exception as e:
        print(f"✗ Failed to create performance script: {e}")

def optimize_opencv():
    """Create optimized OpenCV configuration"""
    opencv_config = '''
# OpenCV Performance Optimization for Raspberry Pi
import cv2
import os

# Set OpenCV thread count to number of CPU cores
cv2.setNumThreads(4)

# Enable OpenCL if available
if cv2.ocl.haveOpenCL():
    cv2.ocl.setUseOpenCL(True)
    print("OpenCL acceleration enabled")

# Optimize camera capture
def get_optimized_camera():
    cap = cv2.VideoCapture(0)
    
    # Set optimal buffer size
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    
    # Set frame rate
    cap.set(cv2.CAP_PROP_FPS, 30)
    
    # Set resolution (adjust based on needs)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    return cap
'''

    try:
        with open('opencv_optimization.py', 'w') as f:
            f.write(opencv_config)
        print("✓ Created OpenCV optimization config")
    except Exception as e:
        print(f"✗ Failed to create OpenCV config: {e}")

if __name__ == "__main__":
    if os.geteuid() != 0:
        print("This script requires root privileges for some optimizations.")
        print("Run with: sudo python3 optimize_performance.py")
        sys.exit(1)
    
    print("=" * 60)
    print("Raspberry Pi 5 Performance Optimization")
    print("=" * 60)
    
    optimize_gpu_memory()
    optimize_camera_settings()
    optimize_cpu_governor()
    optimize_swappiness()
    install_performance_tools()
    create_performance_script()
    optimize_opencv()
    
    print("\n" + "=" * 60)
    print("Optimization completed!")
    print("=" * 60)
    print("\nRecommendations:")
    print("1. Reboot the system: sudo reboot")
    print("2. Monitor performance: ./performance_monitor.sh")
    print("3. Keep system cool with adequate ventilation")
    print("4. Use a fast SD card (Class 10 or better)")
    print("5. Consider using an SSD for better I/O performance")
    print("\nFor maximum performance:")
    print("- Disable unnecessary services")
    print("- Use wired network connection")
    print("- Ensure adequate power supply (5V/3A minimum)")
