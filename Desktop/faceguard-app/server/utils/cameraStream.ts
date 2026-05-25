import { exec } from 'child_process';
import { Writable } from 'stream';

const cameraStream = (outputStream: Writable) => {
    const command = 'raspivid -o - -t 0 -fps 25 -w 640 -h 480'; // Command to start the Raspberry Pi camera stream

    const ffmpeg = exec(command);

    ffmpeg.stdout.pipe(outputStream); // Pipe the camera output to the provided writable stream

    ffmpeg.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`); // Log any errors from the camera stream
    });

    ffmpeg.on('close', (code) => {
        console.log(`Camera stream process exited with code ${code}`); // Log when the stream process exits
    });

    return () => {
        ffmpeg.kill('SIGINT'); // Function to stop the camera stream
    };
};

export default cameraStream;