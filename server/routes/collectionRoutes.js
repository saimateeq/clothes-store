import { Router } from "express";
import * as collectionController from "../controllers/collectionController.js";
import { protect, staffOnly } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { collectionSchema, updateCollectionSchema } from "../validators/productValidators.js";

const router = Router();

router.get("/", collectionController.listCollections);
router.get("/:slug", collectionController.getCollectionBySlug);

router.post("/", protect, staffOnly, validate(collectionSchema), collectionController.createCollection);
router.patch("/:id", protect, staffOnly, validate(updateCollectionSchema), collectionController.updateCollection);
router.delete("/:id", protect, staffOnly, collectionController.deleteCollection);

export default router;
