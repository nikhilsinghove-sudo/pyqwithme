import express from "express";
import { getPublicSettings, updateSettings } from "../controllers/settingsController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getPublicSettings);
router.patch("/", protectAdmin, updateSettings);

export default router;
