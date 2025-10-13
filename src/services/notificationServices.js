// ----------------  SERVICES or QUERIES for the Notification of the BOS Law Firm

import { query } from "../db.js";

// Fetching notifications for users involved that has is_cleared = false
export const getNotificationsByUserId = async (user_id) => {
  const { rows } = await query(
    `
    SELECT *
    FROM notification_tbl
    WHERE (user_id = $1 OR sender_id = $1)
      AND is_cleared = false
    ORDER BY date_created DESC
    `,
    [user_id]
  );
  return rows;
};

// Get Unread Notification Count of a user
export const getUnreadCountByUserId = async (user_id) => {
  const { rows } = await query(
    `SELECT COUNT(*) FROM notification_tbl 
     WHERE (user_id = $1 OR sender_id = $1)
        AND is_read = false`,
    [user_id]
  );
  return rows[0].count;
};
