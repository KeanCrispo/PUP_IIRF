-- Update members table to remove base64 image storage
ALTER TABLE members DROP COLUMN IF EXISTS profile_image;
ALTER TABLE members DROP COLUMN IF EXISTS face_images;

-- Add object storage references
ALTER TABLE members ADD COLUMN profile_image_key TEXT;
ALTER TABLE members ADD COLUMN face_image_keys TEXT;

-- Update detections table to use object storage
ALTER TABLE detections DROP COLUMN IF EXISTS image;
ALTER TABLE detections ADD COLUMN image_key TEXT;
