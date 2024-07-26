import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types";
import { config } from "../config";
import { cookie } from "../util/constants";
import { db } from "../models";

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies[cookie.name];

  if (!token) {
    return res.status(401).json({ message: "Token not found!" });
  }

  try {
    const decoded: any = jwt.verify(token, config.jwt_secret);
    console.log("decoded", decoded);

    const user = await db.User.findById(decoded.id).exec();
    if (user) {
      req.user = { id: user.id || user._id, email: user.email };
      next();
    }
  } catch (error: any) {
    console.error("❌ Auth Error", error.message);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};
