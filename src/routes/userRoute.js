import express from "express";
import multer from "multer";
import path from "path";
import * as userController from "../controllers/userController.js";
import verifyUser from "../middleware/verifyUser.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

// Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "C:/Users/Lenovo i5 8th Gen/Desktop/CAPSTONE/uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, and JPG files are allowed"));
    }
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
});

// Routes
router.get("/users", verifyUser, userController.getUsers);
router.get("/users/count", verifyUser, requireAdmin, userController.countUsers); // for dashboard stats
router.post(
  "/users",
  verifyUser,
  requireAdmin,
  upload.single("user_profile"),
  userController.createUser
);
router.put(
  "/users/:user_id",
  verifyUser,
  upload.single("user_profile"),
  userController.updateUser
);
router.delete(
  "/users/:user_id",
  verifyUser,
  requireAdmin,
  userController.deleteUser
);
router.get(
  "/users/search",
  verifyUser,
  requireAdmin,
  userController.searchUsers
);

// Routes for fetching user logs
router.get("/user-logs", verifyUser, userController.getUserLogs);
router.get("/user-logs/:user_id", verifyUser, userController.getUserLogsById);


// Routes for fetching the lawyers' specializations
router.get(
  "/lawyer-specializations",
  verifyUser,
  userController.getLawyersByCaseCategoryTypes
);

router.put(
  "/users/:user_id/role",
  verifyUser,
  userController.updateUserRole
);

export default router;
