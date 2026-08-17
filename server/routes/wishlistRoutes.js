import { Router } from "express";
import * as wishlistController from "../controllers/wishlistController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

router.get("/", wishlistController.getWishlist);
router.post("/items", wishlistController.addProduct);
router.post("/merge", wishlistController.mergeWishlist);
router.delete("/items/:productId", wishlistController.removeProduct);

export default router;
