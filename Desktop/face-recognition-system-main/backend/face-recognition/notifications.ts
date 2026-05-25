import { api, APIError } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";
import { Notification, NotificationsResponse } from "./types";

// Get notifications with optional limit
export const getNotifications = api<{ limit?: Query<number> }, NotificationsResponse>(
  { expose: true, method: "GET", path: "/api/notifications" },
  async ({ limit = 50 }) => {
    try {
      const rows = await db.queryAll<{
        id: string;
        type: string;
        message: string;
        timestamp: Date;
      }>`
        SELECT * FROM notifications 
        ORDER BY timestamp DESC 
        LIMIT ${limit}
      `;

      const notifications: Notification[] = rows.map(row => ({
        id: row.id,
        type: row.type as "known" | "unknown",
        message: row.message,
        timestamp: row.timestamp
      }));

      return { notifications };
    } catch (error) {
      throw APIError.internal(`Failed to get notifications: ${error}`);
    }
  }
);