import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  createComment,
  getCommentsByPostId,
  getRepliesForComment,
  updateComment,
  deleteComment,
  replyToComment,
} from "../controllers/comment.controller";

/** Comment Routes */
export const commentRouter = (): Router => {
  const router = Router();

  router.post("/", authMiddleware, createComment);
  router.get("/:postId", getCommentsByPostId);
  router.get("/:commentId/replies", getRepliesForComment);
  router.put("/:id", authMiddleware, updateComment);
  router.delete("/:id", authMiddleware, deleteComment);
  router.post("/:id/reply", authMiddleware, replyToComment);

  return router;
};
