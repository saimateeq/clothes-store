import { Router } from "express";
import * as aiController from "../controllers/aiController.js";
import { validate } from "../middleware/validate.js";
import { aiRateLimit } from "../middleware/aiRateLimit.js";
import { stylistSchema, chatSchema } from "../validators/aiValidators.js";

const router = Router();

router.post("/stylist", aiRateLimit, validate(stylistSchema), aiController.stylist);
router.post("/chat", aiRateLimit, validate(chatSchema), aiController.chat);

export default router;
