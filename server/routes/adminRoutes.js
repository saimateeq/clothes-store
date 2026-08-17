import { Router } from "express";
import * as adminController from "../controllers/adminController.js";
import { protect, staffOnly } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect, staffOnly);

router.get("/dashboard", adminController.getDashboard);
router.get("/orders", adminController.listAllOrders);
router.get("/customers", adminController.listCustomers);
router.get("/customers/:id", adminController.getCustomerById);
router.patch("/customers/:id/active", adminController.setCustomerActive);
router.post("/products/bulk", adminController.bulkUpdateProducts);
router.post("/products/:id/duplicate", adminController.duplicateProduct);

export default router;
