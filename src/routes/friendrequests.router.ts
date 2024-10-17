import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
    createFriendRequest,
    getFriendRequestsForUser,
    acceptFriendRequest,rejectFriendRequest,getUserFriends
  } from '../controllers/friendrequest.controller';

export const friendrequestRouter = (): Router => {
    const router = Router();

    router.post('/create',authMiddleware, createFriendRequest);
    router.get('/:userId',authMiddleware, getFriendRequestsForUser);
    router.get("/:requestid/acceptfriendrequest",authMiddleware, acceptFriendRequest);
    router.get("/:requestid/rejectfriendrequest",authMiddleware, rejectFriendRequest);
    router.get("/:userId/friends",authMiddleware, getUserFriends);

    return router;
  }; 
  