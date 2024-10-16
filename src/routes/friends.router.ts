import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getUserFriends } from "../controllers/friend.controller";

export const friendsRouter = (): Router => {
    const router = Router();

    //we get userid in params and in req.user.id
    router.get("/:userId/friends",authMiddleware, getUserFriends);

    return router;
  };  