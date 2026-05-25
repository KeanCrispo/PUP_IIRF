import { Bucket } from "encore.dev/storage/objects";

export const memberImages = new Bucket("member-images", {
  public: true,
  versioned: false,
});

export const detectionImages = new Bucket("detection-images", {
  public: true,
  versioned: false,
});
