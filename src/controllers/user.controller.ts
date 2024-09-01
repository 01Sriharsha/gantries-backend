import { StudentSchema } from "../lib/zod";
import { ROLES } from "../util/constants";
import { apiResponse } from "../util/api-response";
import { asyncHandler } from "../util/async-handler";
import { UserModel } from "../models/user.model";
import { StudentModel } from "../models/student.model";

/** Saves role specific user details */
export const saveUserInfo = asyncHandler(async (req, res) => {
  if (!req.user) {
    return apiResponse(res, 401, { message: "Unauthorized" });
  }
  const userid = req.user.id;
  const { data, error } = StudentSchema.safeParse(req.body);

  if (error) {
    return apiResponse(res, 400, { message: error.errors[0].message });
  }
  const userDoc = await UserModel.findById(userid).select("-password");

  const user = userDoc.toObject();

  const response = { ...user, student: null };

  if (user.role === ROLES.STUDENT) {
    //check if already exists
    const exists = !!(await StudentModel.findOne({ user_id: userid }));

    if (exists) {
      const studentDoc = await StudentModel.findOneAndUpdate(
        { user_id: user._id },
        { ...data }
      );
      response.student = studentDoc.toObject();
    } else {
      const studentDoc = await StudentModel.create({
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
  const studentDoc = await StudentModel.findOne({ user_id: user._id });
  response.student = studentDoc.toObject();

  return apiResponse(res, 201, {
    message: "Details updated successfully!",
    data: response,
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await UserModel.findById(id).select("-password -verifyOTP");

  if (!user) {
    return apiResponse(res, 404, { message: "User not found" });
  }

  if (user.role === "STUDENT") {
    const student = await StudentModel.findOne({ user_id: user._id });
    return apiResponse(res, 200, {
      data: { ...user.toObject(), student: student.toObject() },
    });
  }

  return apiResponse(res, 200, { data: user.toObject() });
});
