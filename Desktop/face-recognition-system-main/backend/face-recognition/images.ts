import { api, APIError } from "encore.dev/api";
import { memberImages, detectionImages } from "./storage";

export interface UploadImageRequest {
  imageData: string;
  imageType: "member" | "detection";
  memberId?: string;
}

export interface UploadImageResponse {
  imageUrl: string;
  imageKey: string;
}

export const uploadImage = api<UploadImageRequest, UploadImageResponse>(
  { expose: true, method: "POST", path: "/api/images/upload" },
  async (req) => {
    try {
      const timestamp = Date.now();
      let imageKey: string;
      let imageUrl: string;

      if (req.imageType === "member") {
        imageKey = `faces/${req.memberId || 'unknown'}/${timestamp}.jpg`;
        const imageBuffer = Buffer.from(req.imageData.split(',')[1], 'base64');
        await memberImages.upload(imageKey, imageBuffer, { contentType: 'image/jpeg' });
        imageUrl = memberImages.publicUrl(imageKey);
      } else {
        imageKey = `detections/${timestamp}.jpg`;
        const imageBuffer = Buffer.from(req.imageData.split(',')[1], 'base64');
        await detectionImages.upload(imageKey, imageBuffer, { contentType: 'image/jpeg' });
        imageUrl = detectionImages.publicUrl(imageKey);
      }

      return { imageUrl, imageKey };
    } catch (error) {
      throw APIError.internal(`Failed to upload image: ${error}`);
    }
  }
);

export interface GetSignedUrlRequest {
  fileName: string;
  imageType: "member" | "detection";
}

export interface GetSignedUrlResponse {
  uploadUrl: string;
  imageKey: string;
}

export const getSignedUploadUrl = api<GetSignedUrlRequest, GetSignedUrlResponse>(
  { expose: true, method: "POST", path: "/api/images/signed-url" },
  async (req) => {
    try {
      const timestamp = Date.now();
      const imageKey = `${req.imageType}s/${timestamp}_${req.fileName}`;
      let uploadUrl: string;

      if (req.imageType === "member") {
        const result = await memberImages.signedUploadUrl(imageKey, { ttl: 3600 });
        uploadUrl = result.url;
      } else {
        const result = await detectionImages.signedUploadUrl(imageKey, { ttl: 3600 });
        uploadUrl = result.url;
      }

      return { uploadUrl, imageKey };
    } catch (error) {
      throw APIError.internal(`Failed to generate signed URL: ${error}`);
    }
  }
);
