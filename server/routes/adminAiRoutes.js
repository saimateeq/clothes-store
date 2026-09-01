import { Router } from "express";
import * as adminAiController from "../controllers/adminAiController.js";
import { protect, staffOnly } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { aiRateLimit } from "../middleware/aiRateLimit.js";
import { productDescriptionSchema, marketingSchema } from "../validators/aiValidators.js";

const router = Router();

router.use(protect, staffOnly);

router.post("/product-description", aiRateLimit, validate(productDescriptionSchema), adminAiController.productDescription);
router.post("/marketing", aiRateLimit, validate(marketingSchema), adminAiController.marketing);
router.get("/insights", aiRateLimit, adminAiController.insights);

export default router;
