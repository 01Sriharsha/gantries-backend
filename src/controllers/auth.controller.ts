import { Request, Response } from "express";
import { generateJWTToken, generateVerificationOTP } from "../util/token";
import { db } from "../models";
import { LoginSchema, UserSchema } from "../lib/zod";
import { AuthRequest } from "../types";
import { cookie } from "../util/constants";
import { sendSMS } from "../lib/twilio";

/** Regsiter Endpoint */
export const register = async (req: Request, res: Response) => {
  const body = req.body;

  const { data, error } = UserSchema.safeParse(body);

  //validate the request body with the defined schema
  if (error) {
    return res.status(400).json({ message: error.errors[0].message });
  }

  try {
    //find existing user
    const userExists = await db.User.findOne({
      email: data.email,
      phone: data.phone,
    });
    if (userExists) {
      console.error("DB Error:", userExists.errors.errors[0].message);
      return res.status(400).json({ message: "User already exists" });
    }

    const verifyOTP = generateVerificationOTP();

    //save the user
    const savedUser = await db.User.create({
      email: data.email,
      password: data.password,
      firstname: data.firstname,
      lastname: data.lastname,
      verifyOTP: verifyOTP,
      phone: data.phone,
    });

    const user = await db.User.findById(savedUser._id).select(
      "-password -verifyOTP"
    );

    //send sms
    await sendSMS(
      user.phone,
      `Your verification OTP for Gantries By eSamudaay is: ${verifyOTP}`
    );

    return res
      .status(201)
      .json({
        message:
          "Registration successful! Verification OTP has been sent to your mobile address.",
        data: user,
      });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

/** Login Endpoint */
export const login = async (req: Request, res: Response) => {
  const body = req.body as { email: string; password: string };
  try {
    const { data, error } = LoginSchema.safeParse(body);
    if (error) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    const existingUser = await db.User.findOne({ email: data.email });

    if (!existingUser) {
      return res.status(401).json({ message: "User not found" });
    }

    const isValidPassword = await existingUser.comparePassword(data.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const userObj = existingUser.toObject();
    const { password, verifyOTP, ...user } = userObj;
    const token = await generateJWTToken(user.id || user._id, user.email);
    const username = user.firstname + " " + user.lastname;

    //add cookie
    res.cookie(cookie.name, token, cookie.options);
    return res
      .status(200)
      .json({ message: `Welcome back ${username}`, data: user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/** Handles OAuth Login and Redirect */
export const handleOAuthLogin = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized OAuth Login!" });
  }
  try {
    const user = await db.User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    const token = await generateJWTToken(user.id || user._id, user.email);
    //add cookie
    res.cookie(cookie.name, token, cookie.options);
    // res.redirect(`${config.client_url}/?OAuth=true`);
    return res
      .status(200)
      .json({ message: `Welcome back ${user.firstname}`, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** Logout endpoint */
export const logout = (req: AuthRequest, res: Response) => {
  if (req.user.id) {
    req.user = null;
  }
  res.cookie(cookie.name, null, { ...cookie.options, expires: new Date(0) });
  res.status(200).json({ message: "Logged out successfully" });
};

/** OTP verification endpoint */
export const verifyOTP = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not Authorized" });
  }

  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(401).json({ message: "verification otp missing!" });
    }
    const user = await db.User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    if (user.verifyOTP !== otp) {
      return res.status(401).json({ message: "Invalid verification otp!" });
    }

    return res.status(200).json({ message: "Verification successfull!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
