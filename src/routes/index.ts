//Register every routes here

import { Router } from "express";
import { authRouter } from "./auth.router";
import { userRouter } from "./user.router";
import { communityRouter } from "./community.router";
import { postRouter } from "./post.router";
import { tagRouter } from "./tag.router";
import { uploadRouter } from "./upload.router";
import { commentRouter } from "./comment.router";
import { authMiddleware } from "../middleware/auth.middleware";
import { collegeRouter } from "./college.router";
import { friendrequestRouter } from "./friendrequests.router";
import {friendsRouter} from "./friends.router";
import {acceptRejectRouter} from "./acceptorreject.route";
export const globalRouter = (): Router => {
  const router = Router();

  // /api will be prefixed to every route here
  router.use("/auth", authRouter());
  router.use("/user", authMiddleware, userRouter());
  router.use("/college", authMiddleware, collegeRouter());
  router.use("/tag", authMiddleware, tagRouter());
  router.use("/community", authMiddleware, communityRouter());
  router.use("/post", authMiddleware, postRouter());
  router.use("/comment", authMiddleware, commentRouter());
  router.use("/upload", authMiddleware, uploadRouter());
  router.use("/friendrequest",authMiddleware,friendrequestRouter());
  router.use("/getfriends",authMiddleware,friendsRouter());
  router.use("/acceptOrReject",authMiddleware,acceptRejectRouter());
  return router;
};
