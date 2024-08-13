// src/models/studentModel.ts
import { Schema, model, Document } from "mongoose";
import { IUser } from "./user.model";
import { Student } from "../types";

export interface IStudent extends Document, Student {
  user_id: IUser["_id"];
}

const studentSchema = new Schema<IStudent>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dateOfBirth: {
      type: String,
      required: true,
    },
    college: {
      type: String,
      required: true,
    },
    course: {
      type: String,
      required: true,
    },
    yearOfEnding: {
      type: String,
      required: true,
    },
    aim: {
      type: String,
      required: true,
    },
    plan: {
      type: String,
      required: true,
    },
    interests: {
      type: [String],
      // required: true,
    },
    //optional
    bio: String,
    gender: String,
    profilePicture: String,
    socialLinks: [String],
  },
  {
    timestamps: true,
  }
);

export const StudentModel = model<IStudent>("Student", studentSchema);
