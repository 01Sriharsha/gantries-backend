import { CollegeModel } from "../models/college.model";
import { asyncHandler } from "../util/async-handler";

export const getAllColleges = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const colleges = await CollegeModel.find({
    collegeName: { $regex: query as string, $options: "i" },
  }).limit(20); // Limit the results for efficiency

  return res.json({data : colleges});
});

export const createCollege = asyncHandler(async (req, res) => {
  const { universityName, collegeName, collegeType, state, district } =
    req.body;

  const existingCollege = await CollegeModel.findOne({ collegeName });

  if (existingCollege) {
    return res.status(400).json({ error: "College already exists" });
  }

  const newCollege = new CollegeModel({
    universityName,
    collegeName,
    collegeType,
    state,
    district,
  });

  await newCollege.save();
  res.status(201).json(newCollege);
});
