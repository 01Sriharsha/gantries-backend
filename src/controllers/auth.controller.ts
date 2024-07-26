import { Request, Response } from "express";
import { generateToken } from "../util/token";
import { db } from "../models";
import { UserSchema } from "../lib/zod";
import { AuthRequest } from "../types";
import { cookie } from "../util/constants";

export const register = async (req: Request, res: Response) => {
  const body = req.body;
  const parsedSchema = UserSchema.safeParse(body);

  //validate the request body with the defined schema
  if (!parsedSchema) {
    return res
      .status(400)
      .json({ message: parsedSchema.error.errors[0].message });
  }

  const userData = parsedSchema.data;

  try {
    //find existing user
    const userExists = await db.User.findOne({ email: userData.email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    //save the user
    const userDoc = await db.User.create({
      email: userData.email,
      password: userData.password,
      firstname: userData.firstname,
      lastname: userData.lastname,
    });

    const user = userDoc.toObject();

    return res
      .status(201)
      .json({ message: "User registered successfully!", data: user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const existingUser = await db.User.findOne({ email });

    if (!existingUser) {
      return res.status(401).json({ message: "User not found" });
    }

    const isValidPassword = await existingUser.comparePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = existingUser;
    const token = await generateToken(user.id || user._id, user.email);

    //add cookie
    res.cookie(cookie.name, token, cookie.options);
    return res.status(200).json({ data: user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = (req: AuthRequest, res: Response) => {
  if (req.user.id) {
    req.user = null;
  }
  res.cookie(cookie.name, null, { ...cookie.options, expires: new Date(0) });
  res.status(200).json({ message: "Logged out successfully" });
};
