import { Request, Response } from "express";
import { TagModel } from "../models/tag.model";
import { apiResponse } from "../util/api-response";
import { asyncHandler } from "../util/async-handler";

// Create a new tag
export const createTag = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;

  const tag = new TagModel({ name });

  await tag.save();

  return apiResponse(res, 201, {
    message: "Tag created successfully",
    data: tag,
  });
});

// Get all tags
export const getAllTags = asyncHandler(async (req: Request, res: Response) => {
  const tags = await TagModel.find();

  return apiResponse(res, 200, { data: tags });
});

// Get a tag by ID
export const getTagById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const tag = await TagModel.findById(id);

  if (!tag) {
    return apiResponse(res, 404, { message: "Tag not found" });
  }

  return apiResponse(res, 200, { data: tag });
});

// Get a tag by ID
export const getTagByName = asyncHandler(
  async (req: Request, res: Response) => {
    const { name } = req.params;

    const tag = await TagModel.findOne({ name });

    if (!tag) {
      return apiResponse(res, 404, { message: "Tag not found" });
    }

    return apiResponse(res, 200, { data: tag });
  }
);

// Update a tag
export const updateTag = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  const tag = await TagModel.findById(id);

  if (!tag) {
    return apiResponse(res, 404, { message: "Tag not found" });
  }

  tag.name = name || tag.name;

  await tag.save();

  return apiResponse(res, 200, {
    message: "Tag updated successfully",
    data: tag,
  });
});

// Delete a tag
export const deleteTag = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const tag = await TagModel.findById(id);

  if (!tag) {
    return apiResponse(res, 404, { message: "Tag not found" });
  }

  await tag.deleteOne();

  return apiResponse(res, 200, { message: "Tag deleted successfully" });
});
