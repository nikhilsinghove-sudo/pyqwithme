import express from "express";
import {
  deleteOwnPaperByCredentials,
  deleteOwnPaper,
  downloadPaper,
  viewPaper,
  getPaperById,
  listPapers,
  updateOwnPaperByCredentials,
  updateOwnPaper,
  uploadPaper,
  verifyOwnerByCredentials,
  verifyOwnerList,
  verifyOwner,
  sharePaper,
  reportPaper
} from "../controllers/paperController.js";
import { uploadPaper as uploadPaperMiddleware } from "../middleware/uploadMiddleware.js";
import { validatePaperUpload } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.get("/", listPapers);
router.get("/:id/view", viewPaper);
router.get("/:id", getPaperById);
router.post("/", uploadPaperMiddleware.single("file"), validatePaperUpload, uploadPaper);
router.post("/owner/verify", verifyOwnerByCredentials);
router.post("/owner/list", verifyOwnerList);
router.patch("/owner", updateOwnPaperByCredentials);
router.delete("/owner", deleteOwnPaperByCredentials);
router.post("/:id/verify-owner", verifyOwner);
router.patch("/:id/owner", updateOwnPaper);
router.post("/:id/owner/delete", deleteOwnPaper);
router.delete("/:id/owner", deleteOwnPaper);
router.post("/:id/download", downloadPaper);
router.get("/:id/download", downloadPaper);
router.post("/:id/share", sharePaper);
router.post("/:id/report", reportPaper);

export default router;

