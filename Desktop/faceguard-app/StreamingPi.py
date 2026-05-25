from flask import Flask, Response
import cv2
import face_recognition
import numpy as np
import requests
import base64
import datetime
import os
import subprocess

SUPABASE_URL = "https://xzxyxuzdgavlvkhxmxvx.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6eHl4dXpkZ2F2bHZraHhteHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNDUyNTksImV4cCI6MjA3NTcyMTI1OX0.ggewVz01P0CZ8UuZ0BWaZ0AYDxETbwCesNJuNoOr9Kg"
SUPABASE_TABLE = "detections"

# Paths to your audio files
AUDIO_PATH = "/home/pi/audio/"
GOOD_MORNING = os.path.join(AUDIO_PATH, "Good_Morning.mp3")
GOOD_AFTERNOON = os.path.join(AUDIO_PATH, "Good_Afternoon.mp3")
GOOD_EVENING = os.path.join(AUDIO_PATH, "Good_Evening.mp3")

app = Flask(__name__)

# --- Load Known Faces from Supabase ---
def load_known_faces():
    """Fetch known faces (name + image) from Supabase table"""
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}?select=name,image",
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}"
        }
    )

    known_face_encodings = []
    known_face_names = []

    if response.status_code == 200:
        records = response.json()
        for record in records:
            name = record["name"]
            image_data = record["image"]

            # If the image is stored as Base64
            img_bytes = base64.b64decode(image_data)
            np_arr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            if img is None:
                continue

            encoding = face_recognition.face_encodings(img)
            if len(encoding) > 0:
                known_face_encodings.append(encoding[0])
                known_face_names.append(name)

    return known_face_encodings, known_face_names


# Load known faces at startup
known_face_encodings, known_face_names = load_known_faces()

camera = cv2.VideoCapture(0)
last_greet_per_person = {}  # cooldown dictionary


# --- Play Greeting with Cooldown ---
def play_greeting(name):
    """Play greeting based on time, per person cooldown"""
    global last_greet_per_person
    now = datetime.datetime.now()

    # 5-minute cooldown per person
    if name in last_greet_per_person:
        if (now - last_greet_per_person[name]).total_seconds() < 300:
            return

    hour = now.hour
    if 5 <= hour < 12:
        audio = GOOD_MORNING
    elif 12 <= hour < 18:
        audio = GOOD_AFTERNOON
    else:
        audio = GOOD_EVENING

    subprocess.Popen(["mpg123", audio],
                     stdout=subprocess.DEVNULL,
                     stderr=subprocess.DEVNULL)

    last_greet_per_person[name] = now


# --- Log Recognition to Supabase ---
def log_to_supabase(name, frame):
    """Upload recognition log to Supabase."""
    now = datetime.datetime.now().isoformat()
    _, buffer = cv2.imencode('.jpg', frame)
    jpg_as_text = base64.b64encode(buffer).decode('utf-8')

    data = {
        "name": name,
        "timestamp": now,
        "image": jpg_as_text
    }

    requests.post(
        f"{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}",
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        },
        json=data
    )


# --- Stream Frames with Recognition ---
def gen_frames():
    while True:
        success, frame = camera.read()
        if not success:
            break

        small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
        rgb_small_frame = small_frame[:, :, ::-1]

        face_locations = face_recognition.face_locations(rgb_small_frame)
        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

        for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
            matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.5)
            name = "Unknown"

            if True in matches:
                match_index = matches.index(True)
                name = known_face_names[match_index]
                play_greeting(name)
                log_to_supabase(name, frame)

            # Draw box and label
            top *= 4; right *= 4; bottom *= 4; left *= 4
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
            cv2.rectangle(frame, (left, bottom - 35), (right, bottom), (0, 255, 0), cv2.FILLED)
            cv2.putText(frame, name, (left + 6, bottom - 6),
                        cv2.FONT_HERSHEY_DUPLEX, 0.8, (255, 255, 255), 1)

        _, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')


# --- Flask Route for Live Stream ---
@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, threaded=True)
