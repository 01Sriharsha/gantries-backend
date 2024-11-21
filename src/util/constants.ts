import { config } from "dotenv";
import { CookieOptions } from "express";

config();

export const ROLES = {
  STUDENT: "STUDENT",
  ADMIN: "ADMIN",
};

export const cookie = {
  name: "_jwt___",
  options: {
    httpOnly: true,
    path: "/",
    secure: Boolean(process.env.SECURE),
    sameSite: process.env.SAME_SITE,
    maxAge: 3600 * 1000,
  } as CookieOptions,
};
