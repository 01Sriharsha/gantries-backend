import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  createFriendRequest,
  getFriendRequestsForUser,
  acceptFriendRequest,
  rejectFriendRequest,
  getUserFriends,
  getAllUnConnectedUsers,
} from "../controllers/friendrequest.controller";

export const friendrequestRouter = (): Router => {
  const router = Router();

  router.post("/create", authMiddleware, createFriendRequest);
  router.get("/:userId", authMiddleware, getFriendRequestsForUser);
  router.post(
    "/:requestId/acceptfriendrequest",
    authMiddleware,
    acceptFriendRequest
  );
  router.post(
    "/:requestId/rejectfriendrequest",
    authMiddleware,
    rejectFriendRequest
  );
  router.get("/:userId/friends", authMiddleware, getUserFriends);
  router.get("/:userId/suggest", authMiddleware, getAllUnConnectedUsers);

  return router;
};
