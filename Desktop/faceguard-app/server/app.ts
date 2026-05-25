import express from 'express';
import bodyParser from 'body-parser';
import videoRoutes from './routes/video';
import { FaceRecognitionController } from './controllers/faceRecognitionController';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize face recognition controller
const faceRecognitionController = new FaceRecognitionController();

// Define routes
app.use('/api/video', videoRoutes(faceRecognitionController));

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});