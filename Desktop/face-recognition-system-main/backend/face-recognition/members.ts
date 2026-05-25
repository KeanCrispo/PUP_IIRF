import { api, APIError } from "encore.dev/api";
import db from "../db";
import { CreateMemberRequest, Member, MembersResponse, SuccessResponse } from "./types";
import { memberImages } from "./storage";

// Get all members from the database
export const getMembers = api<void, MembersResponse>(
  { expose: true, method: "GET", path: "/api/members" },
  async () => {
    try {
      const rows = await db.queryAll<{
        id: string;
        name: string;
        profile_image_key: string;
        face_image_keys: string;
        date_added: Date;
      }>`SELECT * FROM members ORDER BY date_added DESC`;

      const members: Member[] = rows.map(row => {
        const profileImageUrl = row.profile_image_key ? memberImages.publicUrl(row.profile_image_key) : "";
        const faceImageKeys = row.face_image_keys ? JSON.parse(row.face_image_keys) : [];
        const faceImageUrls = faceImageKeys.map((key: string) => memberImages.publicUrl(key));
        
        return {
          id: row.id,
          name: row.name,
          profileImage: profileImageUrl,
          faceImages: faceImageUrls,
          dateAdded: row.date_added
        };
      });

      return { members };
    } catch (error) {
      throw APIError.internal(`Failed to get members: ${error}`);
    }
  }
);

// Add a new member to the database
export const addMember = api<CreateMemberRequest, SuccessResponse>(
  { expose: true, method: "POST", path: "/api/members" },
  async (memberData) => {
    try {
      let profileImageKey = "";
      if (memberData.profileImage) {
        profileImageKey = `profile/${memberData.id}/${Date.now()}.jpg`;
        const imageBuffer = Buffer.from(memberData.profileImage.split(',')[1], 'base64');
        await memberImages.upload(profileImageKey, imageBuffer, { contentType: 'image/jpeg' });
      }

      const faceImageKeys: string[] = [];
      for (let i = 0; i < memberData.faceImages.length; i++) {
        const faceImageKey = `faces/${memberData.id}/${Date.now()}_${i}.jpg`;
        const imageBuffer = Buffer.from(memberData.faceImages[i].split(',')[1], 'base64');
        await memberImages.upload(faceImageKey, imageBuffer, { contentType: 'image/jpeg' });
        faceImageKeys.push(faceImageKey);
      }

      await db.exec`
        INSERT INTO members (id, name, profile_image_key, face_image_keys, date_added)
        VALUES (${memberData.id}, ${memberData.name}, ${profileImageKey}, 
                ${JSON.stringify(faceImageKeys)}, CURRENT_TIMESTAMP)
      `;

      return { success: true, message: "Member added successfully" };
    } catch (error) {
      throw APIError.internal(`Failed to add member: ${error}`);
    }
  }
);

// Delete a member from the database
export const deleteMember = api<{ id: string }, SuccessResponse>(
  { expose: true, method: "DELETE", path: "/api/members/:id" },
  async ({ id }) => {
    try {
      const result = await db.queryRow<{ count: number }>`
        SELECT COUNT(*) as count FROM members WHERE id = ${id}
      `;

      if (!result || result.count === 0) {
        throw APIError.notFound("Member not found");
      }

      await db.exec`DELETE FROM members WHERE id = ${id}`;

      return { success: true, message: "Member deleted successfully" };
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw APIError.internal(`Failed to delete member: ${error}`);
    }
  }
);