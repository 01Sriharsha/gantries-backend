import { generateJWTToken, generateVerificationOTP } from "../util/token";
import { db } from "../models";
import { LoginSchema, UserSchema } from "../lib/zod";
import { AuthRequest } from "../types";
import { cookie } from "../util/constants";
import { sendSMS } from "../lib/twilio";
import { asyncHandler } from "../util/async-handler";
import { UserModel } from "../models/user.model";

/** Regsiter Endpoint */
export const register = asyncHandler(async (req, res) => {
  const body = req.body;

  const { data, error } = UserSchema.safeParse(body);

  //validate the request body with the defined schema
  if (error) {
    return res.status(400).json({ message: error?.errors[0]?.message });
  }
  //find existing user
  const userExists = await db.User.findOne({
    phone: data.phone,
  });
  if (userExists) {
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

  const token = await generateJWTToken(user.id || user._id, user.phone);
  //add cookie
  res.cookie(cookie.name, token, cookie.options);

  return res.status(201).json({
    message:
      "Registration successful! Verification OTP has been sent to your mobile address.",
    data: user,
  });
});

/** Login Endpoint */
export const login = asyncHandler(async (req, res) => {
  const body = req.body as { phone: string; password: string };
  const { data, error } = LoginSchema.safeParse(body);
  if (error) {
    return res.status(400).json({ message: error.errors[0].message });
  }
  const existingUser = await db.User.findOne({ phone: data.phone });

  if (!existingUser) {
    return res.status(401).json({ message: "User not found" });
  }

  const isValidPassword = await existingUser.comparePassword(data.password);

  if (!isValidPassword) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (!existingUser.isVerified) {
    //send sms
    const verifyOTP = existingUser.verifyOTP;
    await sendSMS(
      existingUser.phone,
      `Your verification OTP for Gantries By eSamudaay is: ${verifyOTP}`
    );
    return res.status(400).json({
      message: "You have not verified the phone number! Please verify it!!",
    });
  }

  const userObj = existingUser.toObject();
  const { password, verifyOTP, ...user } = userObj;
  const token = await generateJWTToken(user.id || user._id, user.phone);
  const username = user.firstname + " " + user.lastname;

  //add cookie
  res.cookie(cookie.name, token, cookie.options);
  return res
    .status(200)
    .json({ message: `Welcome back ${username}`, data: user });
});

/** Handles OAuth Login and Redirect */
export const handleOAuthLogin = asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized OAuth Login!" });
  }
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
});

/** Logout endpoint */
export const logout = asyncHandler(async (req: AuthRequest, res) => {
  if (req.user.id) {
    req.user = null;
  }
  res.cookie(cookie.name, null, { ...cookie.options, expires: new Date(0) });
  res.status(200).json({ message: "Logged out successfully" });
});

/** OTP verification endpoint */
export const verifyOTP = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone) {
    return res.status(401).json({ message: "Phone number is missing!" });
  }
  if (!otp) {
    return res.status(401).json({ message: "verification otp missing!" });
  }
  const user = await db.User.findOne({ phone });
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  if (user.verifyOTP !== otp) {
    return res.status(401).json({ message: "Invalid verification otp!" });
  }

  //update the user
  const response = await db.User.updateOne(
    { _id: user._id },
    { isVerified: true }
  );

  if (!response.acknowledged) {
    throw new Error("Failed to verify user!");
  }
  const username = user.firstname + " " + user.lastname;
  const { password, verifyOTP, ...verifiedUser } = user.toObject();
  const token = await generateJWTToken(user.id || user._id, user.phone);
  //add cookie
  res.cookie(cookie.name, token, cookie.options);
  return res
    .status(200)
    .json({
      message: `Verification successfull! Welcome ${username}`,
      data: verifiedUser,
    });
});

/** Authenticates the current logged in user whenever hit to this endpoint */
export const authenticateMe = asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized user" });
  }
  return res.status(200).json({ message: "Authenticated!" });
});
