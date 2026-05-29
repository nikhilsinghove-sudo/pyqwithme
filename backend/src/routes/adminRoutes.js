import express from "express";
import {
  approvePaper,
  deletePaperByAdmin,
  getDashboardStats,
  getCloudinaryStats,
  listAdminPapers,
  previewPaperByAdmin,
  rejectPaper,
  updatePaperByAdmin,
  listReports,
  deleteReport
} from "../controllers/adminController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectAdmin);
router.get("/stats", getDashboardStats);
router.get("/stats/cloudinary", getCloudinaryStats);
router.get("/papers", listAdminPapers);
router.get("/papers/:id/preview", previewPaperByAdmin);
router.patch("/papers/:id", updatePaperByAdmin);
router.patch("/papers/:id/approve", approvePaper);
router.patch("/papers/:id/reject", rejectPaper);
router.delete("/papers/:id", deletePaperByAdmin);
router.get("/reports", listReports);
router.delete("/reports/:id", deleteReport);

export default router;
