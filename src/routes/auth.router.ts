import passport from "passport";
import { Router } from "express";
import {
  handleOAuthLogin,
  login,
  logout,
  register,
  verifyOTP,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

/** Authentication Routes */
export const authRouter = (): Router => {
  const router = Router();

  // For OAuth Login
  router.get(
    "/google/callback",
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
      failureRedirect: "/",
    }),
    handleOAuthLogin
  );

  router.post("/register", register);
  router.post("/login", login);
  router.post("/logout", authMiddleware, logout);
  router.post("/verify-otp", authMiddleware, verifyOTP);

  return router;
};
