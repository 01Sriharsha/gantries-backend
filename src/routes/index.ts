//Register every routes here

import { Router } from "express";
import { authRouter } from "./auth.router";
import { userRouter } from "./user.router";

export const globalRouter = (): Router => {
  const router = Router();

  router.use("/auth", authRouter());
  router.use("/user", userRouter());

  return router;
};
