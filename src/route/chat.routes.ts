import { Router } from "express";
import { chatController } from "../controller/chat.controller";
import { protect } from "../middleware/auth.middleware";
import { checkUsageLimit } from "../middleware/usage.middleware";

const router = Router();

router.post(
  "/",
  protect,
  checkUsageLimit,
  chatController
);

export default router;