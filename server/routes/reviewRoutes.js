import { Router } from "express";
import * as reviewController from "../controllers/reviewController.js";
import { protect, staffOnly } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { createReviewSchema, updateReviewStatusSchema } from "../validators/reviewValidators.js";

const router = Router();

router.get("/", reviewController.listReviewsForProduct);

router.use(protect);

router.get("/mine", reviewController.listMyReviews);
router.post("/", validate(createReviewSchema), reviewController.createReview);
router.delete("/:id", reviewController.deleteReview);

router.get("/admin/all", staffOnly, reviewController.listReviewsForModeration);
router.patch("/:id/status", staffOnly, validate(updateReviewStatusSchema), reviewController.updateReviewStatus);

export default router;
