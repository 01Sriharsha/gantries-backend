import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../types";
import { ROLES } from "../util/constants";

export interface IUser extends Document, User {
  comparePassword: (password: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    verifyOTP: {
      type: String,
      required: false,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    isOAuthUser: {
      type: Boolean,
      required: false,
    },
    role: {
      type: String,
      required: true,
      enum: [ROLES.STUDENT, ROLES.ADMIN],
      default: ROLES.STUDENT,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

export const UserModel = model<IUser>("User", userSchema);
