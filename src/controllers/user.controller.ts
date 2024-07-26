import { Response } from "express";
import { AuthRequest } from "../types";
import { StudentSchema } from "../lib/zod";
import { db } from "../models";
import { ROLES } from "../util/constants";

/** Saves role specific user details */
export const saveUserInfo = async (req: AuthRequest, res: Response) => {
  const userid = req.user.id;
  const { data, error } = StudentSchema.safeParse(req.body);

  if (error) {
    return res.status(400).json({ message: error.errors[0].message });
  }
  try {
    const userDoc = await db.User.findById(userid).select("-password");

    const user = userDoc.toObject();

    const response = { ...user, student: null };

    if (user.role === ROLES.STUDENT) {
      //check if already exists
      const exists = !!(await db.Student.findOne({ user_id: userid }));

      if (exists) {
        const studentDoc = await db.Student.findOneAndUpdate(
          { user_id: user._id },
          { ...data }
        );
        response.student = studentDoc.toObject();
      } else {
        const studentDoc = await db.Student.create({
          user_id: user._id,
          ...data,
        });
        response.student = studentDoc.toObject();
      }
    }

    if (!response.student) {
      throw new Error("Failed to update user details");
    }

    //fetch the updated details
    const studentDoc = await db.Student.findOne({ user_id: user._id });
    response.student = studentDoc.toObject();

    return res
      .status(201)
      .json({ message: "Details updated successfully!", data: response });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
