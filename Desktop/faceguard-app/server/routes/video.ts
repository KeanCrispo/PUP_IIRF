import { Router } from 'express';
import { startStream, stopStream } from '../utils/cameraStream';

const router = Router();

router.get('/start', (req, res) => {
    startStream()
        .then(() => res.status(200).send('Video stream started'))
        .catch(err => res.status(500).send('Error starting video stream: ' + err.message));
});

router.get('/stop', (req, res) => {
    stopStream()
        .then(() => res.status(200).send('Video stream stopped'))
        .catch(err => res.status(500).send('Error stopping video stream: ' + err.message));
});

export default router;