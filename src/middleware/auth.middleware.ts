import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types";
import { config } from "../config";
import { cookie } from "../util/constants";
import { UserModel } from "../models/user.model";

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies[cookie.name];

  if (!token) {
    console.error("❌ Token not found!");
    // return res.status(401).json({ message: "Unauthorized" });
    return next();
  }

  try {
    const decoded: any = jwt.verify(token, config.jwt_secret);
    const user = await UserModel.findById(decoded.id).exec();
    if (user) {
      req.user = { id: user._id as string, email: user.email };
      return next();
    }
  } catch (error: any) {
    console.error("❌ Auth Error", error.message);
    res.cookie(cookie.name , "" , {expires : new Date(0)})
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};
