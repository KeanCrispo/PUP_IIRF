#!/usr/bin/env python3
"""
Camera Test Script for Raspberry Pi Camera Module V3
This script tests camera functionality and settings
"""

import cv2
import time
import sys

def test_camera():
    """Test camera functionality"""
    print("Testing Raspberry Pi Camera Module V3...")
    
    # Try to initialize camera
    try:
        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("ERROR: Could not open camera")
            return False
        
        # Set camera properties for high quality
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        cap.set(cv2.CAP_PROP_FPS, 30)
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        
        # Get actual camera properties
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        print(f"Camera initialized successfully!")
        print(f"Resolution: {width}x{height}")
        print(f"FPS: {fps}")
        
        # Capture a few test frames
        print("Capturing test frames...")
        for i in range(10):
            ret, frame = cap.read()
            if ret:
                print(f"Frame {i+1}: OK ({frame.shape})")
                time.sleep(0.1)
            else:
                print(f"Frame {i+1}: FAILED")
                break
        
        # Save a test image
        ret, frame = cap.read()
        if ret:
            cv2.imwrite('camera_test.jpg', frame)
            print("Test image saved as 'camera_test.jpg'")
        
        cap.release()
        print("Camera test completed successfully!")
        return True
        
    except Exception as e:
        print(f"ERROR: Camera test failed - {e}")
        return False

def check_camera_permissions():
    """Check camera permissions"""
    import os
    import pwd
    import grp
    
    print("Checking camera permissions...")
    
    # Check if user is in video group
    username = pwd.getpwuid(os.getuid()).pw_name
    video_group = grp.getgrnam('video')
    
    if username in video_group.gr_mem:
        print(f"✓ User '{username}' is in video group")
    else:
        print(f"✗ User '{username}' is NOT in video group")
        print("Run: sudo usermod -a -G video $USER")
        print("Then logout and login again")
    
    # Check camera device
    camera_devices = ['/dev/video0', '/dev/video1', '/dev/video10', '/dev/video11']
    for device in camera_devices:
        if os.path.exists(device):
            stat = os.stat(device)
            print(f"✓ Camera device found: {device}")
            print(f"  Permissions: {oct(stat.st_mode)[-3:]}")
            break
    else:
        print("✗ No camera device found")

def test_face_recognition_imports():
    """Test if face recognition libraries can be imported"""
    print("Testing face recognition imports...")
    
    try:
        import face_recognition
        print("✓ face_recognition imported successfully")
    except ImportError as e:
        print(f"✗ face_recognition import failed: {e}")
        return False
    
    try:
        import dlib
        print("✓ dlib imported successfully")
    except ImportError as e:
        print(f"✗ dlib import failed: {e}")
        return False
    
    try:
        import numpy
        print("✓ numpy imported successfully")
    except ImportError as e:
        print(f"✗ numpy import failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("=" * 50)
    print("Raspberry Pi Camera Test Script")
    print("=" * 50)
    
    # Check permissions
    check_camera_permissions()
    print()
    
    # Test imports
    if not test_face_recognition_imports():
        print("Please install required packages first")
        sys.exit(1)
    print()
    
    # Test camera
    if test_camera():
        print("\n✓ All tests passed! Camera is ready for face recognition.")
    else:
        print("\n✗ Camera test failed. Please check camera connection and configuration.")
        sys.exit(1)
