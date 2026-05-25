export interface VideoStreamProps {
    isStreaming: boolean;
    onStartStream: () => void;
    onStopStream: () => void;
}

export interface FaceRecognitionResult {
    detectedFaces: Array<{
        id: string;
        name: string;
        confidence: number;
    }>;
    status: string;
}