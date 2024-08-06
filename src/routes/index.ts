//Register every routes here

import { Router } from "express";
import { authRouter } from "./auth.router";
import { userRouter } from "./user.router";
import { communityRouter } from "./community.router";
import { postRouter } from "./post.router";
import { tagRouter } from "./tag.router";

export const globalRouter = (): Router => {
  const router = Router();

  router.use("/auth", authRouter());
  router.use("/user", userRouter());
  router.use("/tag", tagRouter());
  router.use("/community", communityRouter());
  router.use("/post", postRouter());

  return router;
};
