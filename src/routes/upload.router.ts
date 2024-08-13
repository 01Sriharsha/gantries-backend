import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { uploadMiddleware } from "../middleware/upload.middleware";
import { uploadMultiple, uploadSingle } from "../controllers/upload.controller";

export const uploadRouter = () => {
  const router = Router();
  router.post(
    "/single",
    authMiddleware,
    uploadMiddleware("single"),
    uploadSingle
  );
  router.post(
    "/multiple",
    authMiddleware,
    uploadMiddleware("multiple"),
    uploadMultiple
  );
  return router
};
