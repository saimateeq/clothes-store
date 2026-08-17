import { Router } from "express";
import * as categoryController from "../controllers/categoryController.js";
import { protect, staffOnly } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { categorySchema, updateCategorySchema } from "../validators/productValidators.js";

const router = Router();

router.get("/", categoryController.listCategories);
router.get("/:slug", categoryController.getCategoryBySlug);

router.post("/", protect, staffOnly, validate(categorySchema), categoryController.createCategory);
router.patch("/:id", protect, staffOnly, validate(updateCategorySchema), categoryController.updateCategory);
router.patch("/reorder/bulk", protect, staffOnly, categoryController.reorderCategories);
router.delete("/:id", protect, staffOnly, categoryController.deleteCategory);

export default router;
