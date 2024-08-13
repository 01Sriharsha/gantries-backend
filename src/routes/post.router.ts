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

  router.post("/", createPost);
  router.get("/", getAllPosts);
  router.get("/community/:communityId", getAllPostsByCommunity);
  router.get("/:id" ,  getPostById);
  router.put("/:id", updatePost);
  router.delete("/:id", deletePost);
  router.post("/:id/like", toggleLikePost);

  return router;
};
