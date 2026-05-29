import express from "express";
import { getPoems, createPoem, updatePoem, deletePoem } from "../controllers/poemController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getPoems);
router.post("/", protectAdmin, createPoem);
router.patch("/:id", protectAdmin, updatePoem);
router.delete("/:id", protectAdmin, deletePoem);

export default router;
