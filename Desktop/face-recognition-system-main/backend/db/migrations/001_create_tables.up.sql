-- Create members table
CREATE TABLE members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  profile_image TEXT,
  face_images TEXT,
  date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create detections table
CREATE TABLE detections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  image TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create settings table
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);