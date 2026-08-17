import { Router } from "express";
import * as cartController from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { addCartItemSchema, updateCartItemSchema } from "../validators/cartValidators.js";

const router = Router();

router.use(protect);

router.get("/", cartController.getCart);
router.post("/items", validate(addCartItemSchema), cartController.addItem);
router.post("/merge", cartController.mergeCart);
router.patch("/items/:productId/:size/:color", validate(updateCartItemSchema), cartController.updateItem);
router.delete("/items/:productId/:size/:color", cartController.removeItem);
router.delete("/", cartController.clearCart);

export default router;
