import { CookieOptions } from "express";

export const ROLES = {
  STUDENT: "STUDENT",
  ADMIN: "ADMIN",
};

export const cookie = {
  name: "_jwt___",
  options: {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  } as CookieOptions,
};
