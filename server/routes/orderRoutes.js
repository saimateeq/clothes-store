import { Router } from "express";
import * as orderController from "../controllers/orderController.js";
import { protect, staffOnly } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { createOrderSchema, updateOrderStatusSchema } from "../validators/orderValidators.js";

const router = Router();

router.use(protect);

router.post("/", validate(createOrderSchema), orderController.createOrder);
router.get("/", orderController.getMyOrders);
router.get("/:id", orderController.getOrderById);
router.patch("/:id/status", staffOnly, validate(updateOrderStatusSchema), orderController.updateOrderStatus);

export default router;
