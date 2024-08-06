import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  createPost,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getAllPosts,
  getAllPostsByCommunity,
} from "../controllers/post.controller";

/** Post Routes */
export const postRouter = (): Router => {
  const router = Router();

  router.post("/", authMiddleware, createPost);
  router.get("/", getAllPosts);
  router.get("/community/:communityId", getAllPostsByCommunity);
  router.get("/:id", getPostById);
  router.put("/:id", authMiddleware, updatePost);
  router.delete("/:id", authMiddleware, deletePost);
  router.post("/:id/like", authMiddleware, likePost);
  router.post("/:id/unlike", authMiddleware, unlikePost);

  return router;
};
