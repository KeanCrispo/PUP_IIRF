import React from 'react';

type FaceRecognitionStatusProps = {
  status: string;
  detectedFaces: string[];
};

const FaceRecognitionStatus: React.FC<FaceRecognitionStatusProps> = ({ status, detectedFaces }) => {
  return (
    <div>
      <h3>Face Recognition Status</h3>
      <p>Status: {status}</p>
      <p>Detected Faces: {detectedFaces.length}</p>
    </div>
  );
};

export default FaceRecognitionStatus;