import express from "express";

import * as notificationController from "../controllers/notificationController.js";
import verifyUser from "../middleware/verifyUser.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

router.get(
  "/notifications",
  verifyUser,
  notificationController.getNotifications
);

export default router;
