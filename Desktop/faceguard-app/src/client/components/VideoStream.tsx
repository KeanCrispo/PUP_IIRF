import React from 'react';

const MJPEG_STREAM_URL = "http://<raspberrypi-ip>:8080/?action=stream"; // Replace with your Pi's IP

const VideoStream: React.FC = () => {
  return (
    <div>
      <h3>Live Video Stream</h3>
      <img
        src={MJPEG_STREAM_URL}
        alt="Live Camera Feed"
        style={{ width: '100%', maxWidth: '640px', border: '1px solid #ccc' }}
      />
    </div>
  );
};

export default VideoStream;