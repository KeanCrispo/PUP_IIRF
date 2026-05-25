import { api, APIError } from "encore.dev/api";
import db from "../db";
import { Stats } from "./types";

// Get dashboard statistics
export const getStats = api<void, Stats>(
  { expose: true, method: "GET", path: "/api/stats" },
  async () => {
    try {
      // Get total members
      const membersResult = await db.queryRow<{ count: number }>`
        SELECT COUNT(*) as count FROM members
      `;
      const totalMembers = membersResult?.count || 0;

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];

      // Get known detections today
      const knownResult = await db.queryRow<{ count: number }>`
        SELECT COUNT(*) as count 
        FROM detections 
        WHERE DATE(timestamp) = ${today} AND type = 'Known'
      `;
      const knownToday = knownResult?.count || 0;

      // Get unknown detections today
      const unknownResult = await db.queryRow<{ count: number }>`
        SELECT COUNT(*) as count 
        FROM detections 
        WHERE DATE(timestamp) = ${today} AND type = 'Unknown'
      `;
      const unknownToday = unknownResult?.count || 0;

      return {
        totalMembers,
        knownToday,
        unknownToday
      };
    } catch (error) {
      throw APIError.internal(`Failed to get stats: ${error}`);
    }
  }
);