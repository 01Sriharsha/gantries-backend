import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  createCommunity,
  getCommunityById,
  updateCommunity,
  deleteCommunity,
  addMemberToCommunity,
  subscribeToCommunity,
  getCommunityByName,
  getAllCommunities,
} from "../controllers/community.controller";

/** Community Routes */
export const communityRouter = (): Router => {
  const router = Router();

  router.post("/", authMiddleware, createCommunity);
  router.get("/", getAllCommunities);
  router.get("/:id", getCommunityById);
  router.get("/name/:name", getCommunityByName);
  router.put("/:id", authMiddleware, updateCommunity);
  router.delete("/:id", authMiddleware, deleteCommunity);
  router.post("/:id/join", authMiddleware, addMemberToCommunity);
  router.post("/:id/subscribe", authMiddleware, subscribeToCommunity);

  return router;
};
