import { Router } from "express";
import * as paymentController from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Note: the webhook route is NOT mounted here — it's registered directly in
// app.js with express.raw() ahead of the global JSON parser (see app.js for
// why). This router only carries the authenticated, JSON-bodied endpoints.
router.post("/create-intent", protect, paymentController.createPaymentIntent);

export default router;
