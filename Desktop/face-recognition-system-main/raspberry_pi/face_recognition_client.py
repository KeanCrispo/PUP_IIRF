#!/usr/bin/env python3
"""
Raspberry Pi Face Recognition Client
Captures video from camera, performs face recognition, and sends results to backend
"""

import cv2
import face_recognition
import numpy as np
import requests
import base64
import json
import time
import os
from datetime import datetime
from typing import List, Dict, Tuple
import pickle

API_URL = os.getenv('API_URL', 'https://face-recognition-system-d34lg8c82vjsu683vkqg.lp.dev')

class FaceRecognitionClient:
    def __init__(self):
        self.known_face_encodings = []
        self.known_face_names = []
        self.known_face_ids = []
        self.detection_cooldown = {}
        self.cooldown_seconds = 5
        self.camera = None
        self.process_every_n_frames = 2
        self.frame_count = 0
        
    def load_known_faces(self):
        """Load known faces from the backend API"""
        try:
            response = requests.get(f'{API_URL}/api/members')
            response.raise_for_status()
            members = response.json()['members']
            
            print(f"Loading {len(members)} members from backend...")
            
            self.known_face_encodings = []
            self.known_face_names = []
            self.known_face_ids = []
            
            for member in members:
                member_id = member['id']
                member_name = member['name']
                face_images = member['faceImages']
                
                if not face_images:
                    print(f"Warning: No face images for {member_name}")
                    continue
                
                for img_url in face_images:
                    try:
                        img_response = requests.get(img_url)
                        img_response.raise_for_status()
                        
                        nparr = np.frombuffer(img_response.content, np.uint8)
                        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                        
                        encodings = face_recognition.face_encodings(rgb_image)
                        
                        if encodings:
                            self.known_face_encodings.append(encodings[0])
                            self.known_face_names.append(member_name)
                            self.known_face_ids.append(member_id)
                            print(f"  ✓ Loaded encoding for {member_name}")
                        else:
                            print(f"  ✗ No face found in image for {member_name}")
                            
                    except Exception as e:
                        print(f"  ✗ Error loading image for {member_name}: {e}")
            
            print(f"Successfully loaded {len(self.known_face_encodings)} face encodings")
            return True
            
        except Exception as e:
            print(f"Error loading known faces: {e}")
            return False
    
    def send_detection(self, name: str, detection_type: str, image_frame):
        """Send detection to backend API"""
        try:
            _, buffer = cv2.imencode('.jpg', image_frame)
            image_base64 = base64.b64encode(buffer).decode('utf-8')
            image_data = f'data:image/jpeg;base64,{image_base64}'
            
            payload = {
                'name': name,
                'type': detection_type,
                'image': image_data
            }
            
            response = requests.post(f'{API_URL}/api/detections', json=payload)
            response.raise_for_status()
            
            print(f"Detection sent: {detection_type} - {name}")
            return True
            
        except Exception as e:
            print(f"Error sending detection: {e}")
            return False
    
    def can_detect(self, person_id: str) -> bool:
        """Check if enough time has passed since last detection of this person"""
        current_time = time.time()
        
        if person_id not in self.detection_cooldown:
            self.detection_cooldown[person_id] = current_time
            return True
        
        time_since_last = current_time - self.detection_cooldown[person_id]
        
        if time_since_last >= self.cooldown_seconds:
            self.detection_cooldown[person_id] = current_time
            return True
        
        return False
    
    def process_frame(self, frame):
        """Process a single frame for face recognition"""
        self.frame_count += 1
        
        if self.frame_count % self.process_every_n_frames != 0:
            return frame
        
        small_frame = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)
        rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
        
        face_locations = face_recognition.face_locations(rgb_small_frame, model='hog')
        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
        
        for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
            top *= 2
            right *= 2
            bottom *= 2
            left *= 2
            
            name = "Unknown"
            person_id = "unknown"
            detection_type = "Unknown"
            color = (0, 0, 255)
            
            if len(self.known_face_encodings) > 0:
                matches = face_recognition.compare_faces(
                    self.known_face_encodings, 
                    face_encoding, 
                    tolerance=0.6
                )
                
                face_distances = face_recognition.face_distance(
                    self.known_face_encodings, 
                    face_encoding
                )
                
                if len(face_distances) > 0:
                    best_match_index = np.argmin(face_distances)
                    
                    if matches[best_match_index]:
                        name = self.known_face_names[best_match_index]
                        person_id = self.known_face_ids[best_match_index]
                        detection_type = "Known"
                        color = (0, 255, 0)
            
            if self.can_detect(person_id):
                face_image = frame[max(0, top-20):min(frame.shape[0], bottom+20), 
                                   max(0, left-20):min(frame.shape[1], right+20)]
                self.send_detection(name, detection_type, face_image)
            
            cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
            cv2.rectangle(frame, (left, bottom - 35), (right, bottom), color, cv2.FILLED)
            cv2.putText(frame, name, (left + 6, bottom - 6), 
                       cv2.FONT_HERSHEY_DUPLEX, 0.6, (255, 255, 255), 1)
        
        return frame
    
    def start(self):
        """Start the face recognition system"""
        print("Starting Face Recognition Client...")
        print(f"API URL: {API_URL}")
        
        if not self.load_known_faces():
            print("Failed to load known faces. Continuing anyway...")
        
        print("Initializing camera...")
        self.camera = cv2.VideoCapture(0)
        
        if not self.camera.isOpened():
            print("ERROR: Could not open camera")
            return
        
        self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        self.camera.set(cv2.CAP_PROP_FPS, 30)
        self.camera.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        
        print("Camera initialized successfully!")
        print("Press 'q' to quit, 'r' to reload faces")
        
        try:
            while True:
                ret, frame = self.camera.read()
                
                if not ret:
                    print("Failed to grab frame")
                    break
                
                processed_frame = self.process_frame(frame)
                
                cv2.imshow('Face Recognition', processed_frame)
                
                key = cv2.waitKey(1) & 0xFF
                
                if key == ord('q'):
                    print("Quitting...")
                    break
                elif key == ord('r'):
                    print("Reloading known faces...")
                    self.load_known_faces()
                
        except KeyboardInterrupt:
            print("\nStopping...")
        
        finally:
            self.camera.release()
            cv2.destroyAllWindows()
            print("Camera released")

if __name__ == "__main__":
    client = FaceRecognitionClient()
    client.start()
