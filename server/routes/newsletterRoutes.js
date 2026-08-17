import { Router } from "express";
import * as newsletterController from "../controllers/newsletterController.js";
import { protect, staffOnly } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { subscribeSchema } from "../validators/newsletterValidators.js";

const router = Router();

router.post("/subscribe", validate(subscribeSchema), newsletterController.subscribe);
router.get("/", protect, staffOnly, newsletterController.listSubscribers);

export default router;
