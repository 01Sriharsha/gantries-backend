import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
    createFriendRequest,
    getFriendRequestsForUser,
  } from '../controllers/friendrequest.controller';

export const friendrequestRouter = (): Router => {
    const router = Router();

    router.post('/create',authMiddleware, createFriendRequest);
    router.get('/:userId',authMiddleware, getFriendRequestsForUser);

    return router;
  }; 
  