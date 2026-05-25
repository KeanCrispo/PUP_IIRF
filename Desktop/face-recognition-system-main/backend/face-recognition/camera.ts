import { api } from "encore.dev/api";
import { SuccessResponse } from "./types";

// Camera state management (simplified for demo)
let cameraState = {
  isRunning: false
};

// Start camera
export const startCamera = api<void, SuccessResponse>(
  { expose: true, method: "POST", path: "/api/camera/start" },
  async () => {
    cameraState.isRunning = true;
    return { success: true, message: "Camera started successfully" };
  }
);

// Stop camera
export const stopCamera = api<void, SuccessResponse>(
  { expose: true, method: "POST", path: "/api/camera/stop" },
  async () => {
    cameraState.isRunning = false;
    return { success: true, message: "Camera stopped successfully" };
  }
);

// Get camera status
export const getCameraStatus = api<void, { isRunning: boolean }>(
  { expose: true, method: "GET", path: "/api/camera/status" },
  async () => {
    return { isRunning: cameraState.isRunning };
  }
);