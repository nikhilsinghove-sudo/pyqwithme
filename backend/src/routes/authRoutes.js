import express from "express";
import { getAdminProfile, loginAdmin } from "../controllers/authController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/admin/login", loginAdmin);
router.get("/admin/me", protectAdmin, getAdminProfile);

export default router;
