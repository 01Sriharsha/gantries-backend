import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { saveUserInfo } from "../controllers/user.controller";

/** User Routes */
export const userRouter = (): Router => {
  const router = Router();

  router.post("/save-info", authMiddleware, saveUserInfo);

  return router;
};