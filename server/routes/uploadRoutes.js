import { Router } from "express";
import * as uploadController from "../controllers/uploadController.js";
import { protect, staffOnly } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.post("/", protect, staffOnly, upload.array("images", 8), uploadController.uploadImages);

export default router;
