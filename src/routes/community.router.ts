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
  isSubscribed,
} from "../controllers/community.controller";

/** Community Routes */
export const communityRouter = (): Router => {
  const router = Router();

  router.post("/", createCommunity);
  router.get("/", getAllCommunities);
  router.get("/:id", getCommunityById);
  router.get("/name/:name", getCommunityByName);
  router.put("/:id", updateCommunity);
  router.delete("/:id", deleteCommunity);
  router.post("/:id/join", addMemberToCommunity);
  router.post("/:id/subscribe", subscribeToCommunity);
  router.post("/:id/isSubscribed", isSubscribed);

  return router;
};
