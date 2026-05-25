from flask import Flask, Response
import cv2
import face_recognition
import numpy as np
import requests
import base64
import datetime
import os
import subprocess

# === Supabase Configuration ===
SUPABASE_URL = "https://xzxyxuzdgavlvkhxmxvx.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6eHl4dXpkZ2F2bHZraHhteHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNDUyNTksImV4cCI6MjA3NTcyMTI1OX0.ggewVz01P0CZ8UuZ0BWaZ0AYDxETbwCesNJuNoOr9Kg"
SUPABASE_TABLE = "detections"

# === Audio Files ===
AUDIO_PATH = "/home/pi/audio/"
GOOD_MORNING = os.path.join(AUDIO_PATH, "Good_Morning.mp3")
GOOD_AFTERNOON = os.path.join(AUDIO_PATH, "Good_Afternoon.mp3")
GOOD_EVENING = os.path.join(AUDIO_PATH, "Good_Evening.mp3")

# === Flask App ===
app = Flask(__name__)

# === Face Recognition Data ===
known_face_encodings = []
known_face_names = []


def fetch_known_faces():
    """
    Fetch known faces from Supabase table 'detections'.
    Expected columns: name (text), image (Base64 string of face)
    """
    print("[INFO] Fetching known faces from Supabase...")
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}?select=name,image",
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
            },
        )

        if response.status_code == 200:
            data = response.json()
            for entry in data:
                name = entry.get("name")
                image_b64 = entry.get("image")
                if not image_b64:
                    continue

                img_data = base64.b64decode(image_b64)
                np_img = np.frombuffer(img_data, np.uint8)
                img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

                encoding = face_recognition.face_encodings(img)
                if encoding:
                    known_face_encodings.append(encoding[0])
                    known_face_names.append(name)
            print(f"[INFO] Loaded {len(known_face_names)} known faces from Supabase.")
        else:
            print("[ERROR] Failed to fetch known faces:", response.text)
    except Exception as e:
        print("[ERROR] Exception while fetching faces:", e)


def play_greeting():
    """Play greeting based on current time of day."""
    now_hour = datetime.datetime.now().hour
    if 5 <= now_hour < 12:
        audio = GOOD_MORNING
    elif 12 <= now_hour < 18:
        audio = GOOD_AFTERNOON
    else:
        audio = GOOD_EVENING

    if os.path.exists(audio):
        subprocess.Popen(["mpg123", audio], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    else:
        print(f"[WARN] Audio file not found: {audio}")


def log_to_supabase(name, frame):
    """Upload recognition log to Supabase with timestamp and image."""
    try:
        now = datetime.datetime.now().isoformat()
        _, buffer = cv2.imencode(".jpg", frame)
        jpg_as_text = base64.b64encode(buffer).decode("utf-8")

        data = {"name": name, "timestamp": now, "image": jpg_as_text}

        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}",
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=minimal",
            },
            json=data,
        )

        if response.status_code not in [200, 201]:
            print("[ERROR] Failed to log to Supabase:", response.text)
        else:
            print(f"[INFO] Logged detection for {name} at {now}")
    except Exception as e:
        print("[ERROR] Exception in log_to_supabase:", e)


# === Load known faces once at startup ===
fetch_known_faces()

# === Initialize Camera ===
camera = cv2.VideoCapture(0)


def gen_frames():
    """Generate video frames with face recognition overlay."""
    recognized_names = set()

    while True:
        success, frame = camera.read()
        if not success:
            break

        small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
        rgb_small_frame = small_frame[:, :, ::-1]

        face_locations = face_recognition.face_locations(rgb_small_frame)
        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

        for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
            matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
            name = "Unknown"

            face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
            if len(face_distances) > 0:
                best_match_index = np.argmin(face_distances)
                if matches[best_match_index]:
                    name = known_face_names[best_match_index]

            top *= 4
            right *= 4
            bottom *= 4
            left *= 4

            color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
            cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
            cv2.rectangle(frame, (left, bottom - 35), (right, bottom), color, cv2.FILLED)
            cv2.putText(frame, name, (left + 6, bottom - 6), cv2.FONT_HERSHEY_DUPLEX, 0.8, (255, 255, 255), 1)

            if name != "Unknown" and name not in recognized_names:
                recognized_names.add(name)
                play_greeting()
                log_to_supabase(name, frame)

        _, buffer = cv2.imencode(".jpg", frame)
        frame = buffer.tobytes()

        yield (b"--frame\r\n"
               b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n")


@app.route("/stream.mjpg")
def stream():
    return Response(gen_frames(), mimetype="multipart/x-mixed-replace; boundary=frame")


@app.route("/")
def index():
    return "<h2>Raspberry Pi Live Face Recognition Stream</h2><img src='/stream.mjpg' width='640'/>"


if __name__ == "__main__":
    print("[INFO] Starting Flask face recognition server...")
    app.run(host="0.0.0.0", port=8000)
