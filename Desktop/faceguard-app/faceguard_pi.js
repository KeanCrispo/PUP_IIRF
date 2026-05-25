import * as faceapi from '@vladmandic/face-api';
import * as canvas from '@vladmandic/canvas';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import NodeWebcam from 'node-webcam';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = 'https://xzxyxuzdgavlvkhxmxvx.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6eHl4dXpkZ2F2bHZraHhteHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNDUyNTksImV4cCI6MjA3NTcyMTI1OX0.ggewVz01P0CZ8UuZ0BWaZ0AYDxETbwCesNJuNoOr9Kg'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData, fetch });

const MODEL_URL = 'http://10.125.224.6:3000/models';

async function loadModels() {
  console.log('[INFO] Loading models...');
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
  console.log('[INFO] Models loaded.');
}

const webcam = NodeWebcam.create({
  width: 640,
  height: 480,
  device: false,
  callbackReturn: 'location',
  output: 'jpeg',
});

async function analyzeFrame() {
  return new Promise((resolve, reject) => {
    const file = `capture_${Date.now()}.jpg`;
    webcam.capture(file, async (err, data) => {
      if (err) return reject(err);
      const img = await canvas.loadImage(file);
      const detections = await faceapi
        .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors()
        .withAgeAndGender();

      if (detections.length > 0) {
        console.log(`[AI] ${detections.length} face(s) detected`);
        // Save photo and metadata to Supabase
        const buffer = fs.readFileSync(file);
        const fileName = `detections/${uuidv4()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('detections')
          .upload(fileName, buffer, { contentType: 'image/jpeg' });
        if (!uploadError) {
          const imageURL = `${SUPABASE_URL}/storage/v1/object/public/detections/${fileName}`;
          await supabase.from('detections').insert({
            id: uuidv4(),
            name: 'Unknown',
            type: 'detected',
            image: imageURL,
            timestamp: new Date().toISOString(),
          });
          console.log('[UPLOAD] Detection saved to Supabase');
        }
      }
      fs.unlinkSync(file); // delete temp frame
      resolve();
    });
  });
}

(async () => {
  await loadModels();
  console.log('[START] Running face detection every 5 seconds...');
  setInterval(analyzeFrame, 5000);
})();
