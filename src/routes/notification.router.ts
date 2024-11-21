import { authMiddleware } from "../middleware/auth.middleware";
import { Router } from "express";
import { getAllNotificationsOfUser } from "../controllers/notification.controller";

export const notificationRouter = (): Router => {
  const router = Router();
  router.get("/", authMiddleware, getAllNotificationsOfUser);
  return router;
};
