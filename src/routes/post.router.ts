import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  createPost,
  getPostById,
  updatePost,
  deletePost,
  getAllPosts,
  getAllPostsByCommunity,
  toggleLikePost,
} from "../controllers/post.controller";

/** Post Routes */
export const postRouter = (): Router => {
  const router = Router();

  router.post("/", authMiddleware, createPost);
  router.get("/", authMiddleware, getAllPosts);
  router.get("/community/:communityId", authMiddleware, getAllPostsByCommunity);
  router.get("/:id", authMiddleware, getPostById);
  router.put("/:id", authMiddleware, updatePost);
  router.delete("/:id", authMiddleware, deletePost);
  router.post("/:id/like", authMiddleware, toggleLikePost);

  return router;
};
