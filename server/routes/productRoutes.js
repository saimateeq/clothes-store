import { Router } from "express";
import * as productController from "../controllers/productController.js";
import { protect, staffOnly, attachUserIfPresent } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { productSchema, updateProductSchema } from "../validators/productValidators.js";

const router = Router();

router.get("/", productController.listProducts);
router.get("/search", productController.searchProducts);
router.get("/facets", productController.getProductFacets);
router.get("/recommended", attachUserIfPresent, productController.getRecommendedProducts);
router.get("/id/:id", protect, staffOnly, productController.getProductById);
router.get("/admin/all", protect, staffOnly, productController.listProductsAdmin);
router.get("/:slug", attachUserIfPresent, productController.getProductBySlug);

router.post("/", protect, staffOnly, validate(productSchema), productController.createProduct);
router.patch("/:id", protect, staffOnly, validate(updateProductSchema), productController.updateProduct);
router.patch("/:id/active", protect, staffOnly, productController.setProductActive);
router.delete("/:id", protect, staffOnly, productController.deleteProduct);

export default router;
