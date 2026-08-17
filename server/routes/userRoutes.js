import { Router } from "express";
import * as userController from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { updateProfileSchema, addressSchema } from "../validators/authValidators.js";

const router = Router();

router.use(protect);

router.patch("/profile", validate(updateProfileSchema), userController.updateProfile);

router.get("/addresses", userController.listAddresses);
router.post("/addresses", validate(addressSchema), userController.createAddress);
router.patch("/addresses/:id", validate(addressSchema.partial()), userController.updateAddress);
router.delete("/addresses/:id", userController.deleteAddress);

export default router;
