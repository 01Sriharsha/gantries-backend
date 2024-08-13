import { Schema, model, Document } from "mongoose";

interface ICollege extends Document {
  universityName: string;
  collegeName: string;
  collegeType: string;
  state: string;
  district: string;
}

const CollegeSchema = new Schema<ICollege>({
  universityName: {
    type: String,
    required: true,
    trim: true,
  },
  collegeName: {
    type: String,
    required: true,
    trim: true,
  },
  collegeType: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  district: {
    type: String,
    required: true,
    trim: true,
  },
});

export const CollegeModel = model<ICollege>("College", CollegeSchema);
