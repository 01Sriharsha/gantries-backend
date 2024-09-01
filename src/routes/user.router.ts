import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getUserById, saveUserInfo } from "../controllers/user.controller";

/** User Routes */
export const userRouter = (): Router => {
  const router = Router();

  router.post("/basic-info", authMiddleware, saveUserInfo);
  router.get("/:id", getUserById);

  return router;
};
