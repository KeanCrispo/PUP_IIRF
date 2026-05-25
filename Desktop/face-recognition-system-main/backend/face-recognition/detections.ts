import { api, APIError } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";
import { Detection, DetectionsResponse, AddDetectionRequest, SuccessResponse } from "./types";
import { detectionImages } from "./storage";

// Get detections with optional limit
export const getDetections = api<{ limit?: Query<number> }, DetectionsResponse>(
  { expose: true, method: "GET", path: "/api/detections" },
  async ({ limit = 100 }) => {
    try {
      const rows = await db.queryAll<{
        id: string;
        name: string;
        type: string;
        image_key: string;
        timestamp: Date;
      }>`
        SELECT * FROM detections 
        ORDER BY timestamp DESC 
        LIMIT ${limit}
      `;

      const detections: Detection[] = rows.map(row => {
        const imageUrl = row.image_key ? detectionImages.publicUrl(row.image_key) : "";
        return {
          id: row.id,
          name: row.name,
          type: row.type as "Known" | "Unknown",
          image: imageUrl,
          timestamp: row.timestamp
        };
      });

      return { detections };
    } catch (error) {
      throw APIError.internal(`Failed to get detections: ${error}`);
    }
  }
);

// Add a new detection
export const addDetection = api<AddDetectionRequest, SuccessResponse>(
  { expose: true, method: "POST", path: "/api/detections" },
  async (detectionData) => {
    try {
      const detectionId = Date.now().toString();
      const timestamp = new Date();

      let imageKey = "";
      if (detectionData.image) {
        imageKey = `detections/${detectionId}.jpg`;
        const imageBuffer = Buffer.from(detectionData.image.split(',')[1], 'base64');
        await detectionImages.upload(imageKey, imageBuffer, { contentType: 'image/jpeg' });
      }

      await db.exec`
        INSERT INTO detections (id, name, type, image_key, timestamp)
        VALUES (${detectionId}, ${detectionData.name}, ${detectionData.type}, 
                ${imageKey}, ${timestamp})
      `;

      // Also create a notification
      const notificationId = (Date.now() + 1).toString();
      const message = `${detectionData.type} person detected: ${detectionData.name}`;
      const notificationType = detectionData.type.toLowerCase();

      await db.exec`
        INSERT INTO notifications (id, type, message, timestamp)
        VALUES (${notificationId}, ${notificationType}, ${message}, ${timestamp})
      `;

      return { success: true, message: "Detection recorded" };
    } catch (error) {
      throw APIError.internal(`Failed to add detection: ${error}`);
    }
  }
);