import { Router } from "express";
import {
  createOrder,
  verifyPayment
} from "../controller/payment.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.post("/create-order",protect, createOrder);
router.post("/verify-payment", verifyPayment);

export default router;