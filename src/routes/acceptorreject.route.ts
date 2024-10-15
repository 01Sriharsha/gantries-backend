import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {acceptFriendRequest,rejectFriendRequest} from "../controllers/acceptorreject.controller";

export const acceptRejectRouter = (): Router => {
    const router = Router();

    //we get userid in params and in req.user.id
    router.get("/:requestid/acceptfriendrequest",authMiddleware, acceptFriendRequest);
    router.get("/:requestid/rejectfriendrequest",authMiddleware, rejectFriendRequest);

    return router;
  };  