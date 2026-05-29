import express from "express";
import { getPopularExams, getPublicStats, recordVisitor } from "../controllers/analyticsController.js";

const router = express.Router();

router.post("/visitors", recordVisitor);
router.get("/public-stats", getPublicStats);
router.get("/popular-exams", getPopularExams);

export default router;
