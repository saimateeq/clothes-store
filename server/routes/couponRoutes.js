import { Router } from "express";
import * as couponController from "../controllers/couponController.js";
import { protect, staffOnly } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { couponRateLimit } from "../middleware/authRateLimit.js";
import { couponSchema, updateCouponSchema, validateCouponSchema } from "../validators/couponValidators.js";

const router = Router();

router.use(protect);

router.post("/validate", couponRateLimit, validate(validateCouponSchema), couponController.validateCoupon);

router.get("/", staffOnly, couponController.listCoupons);
router.post("/", staffOnly, validate(couponSchema), couponController.createCoupon);
router.patch("/:id", staffOnly, validate(updateCouponSchema), couponController.updateCoupon);
router.delete("/:id", staffOnly, couponController.deleteCoupon);

export default router;
