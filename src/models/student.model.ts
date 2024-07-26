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
    gender: {
      type: String,
      required: true,
    },
    institution: {
      type: String,
      required: true,
    },
    qualification: {
      type: String,
      required: true,
    },
    fieldOfStudy: {
      type: String,
      required: true,
    },
    interests: {
      type: [String],
      required: true,
    },
    //optional
    bio: String,
    profilePicture: String,
    socialLinks: [String],
  },
  {
    timestamps: true,
  }
);

export const StudentModel = model<IStudent>("Student", studentSchema);
