import { Request, Response } from "express";
import { CommunityModel } from "../models/community.model";
import { AuthRequest } from "../types";
import { apiResponse } from "../util/api-response";
import { asyncHandler } from "../util/async-handler";
import { getOrCreateTags } from "../util/helper";
import { ITag } from "../models/tag.model";

// Create a new community
export const createCommunity = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { name, description, picture, tags } = req.body;

    if (!req.user) {
      return apiResponse(res, 401, { message: "Unauthorized user" });
    }

    const tagDocs = await getOrCreateTags(tags);

    const existingCommunity = await CommunityModel.findOne({ name });

    if (existingCommunity) {
      return apiResponse(res, 400, {
        message: "Community name is already taken",
      });
    }

    const community = new CommunityModel({
      name,
      description,
      createdBy: req.user.id,
      picture,
      tags: tagDocs.map((tag) => tag._id),
    });

    await community.save();

    return apiResponse(res, 201, {
      message: "Community created successfully",
      data: community,
    });
  }
);

// Get a all communities
export const getAllCommunities = asyncHandler(
  async (req: Request, res: Response) => {
    const communities = await CommunityModel.find()
      .populate("createdBy", "_id username email")
      .populate("tags", "_id name");

    return apiResponse(res, 200, { data: communities });
  }
);

// Get a community by ID
export const getCommunityById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const community = await CommunityModel.findById(id)
      .populate("createdBy", "_id username email")
      .populate("members", "_id username email")
      .populate("subscribers", "_id username email")
      .populate("tags", "_id name");

    if (!community) {
      return apiResponse(res, 404, { message: "Community not found" });
    }

    return apiResponse(res, 200, { data: community });
  }
);

// Get a community by ID
export const getCommunityByName = asyncHandler(
  async (req: Request, res: Response) => {
    const { name } = req.params;

    const community = await CommunityModel.findOne({ name })
      .populate("createdBy", "_id username email")
      .populate("members", "_id username email")
      .populate("subscribers", "_id username email")
      .populate("tags", "_id name");

    if (!community) {
      return apiResponse(res, 404, { message: "Community not found" });
    }

    return apiResponse(res, 200, { data: community });
  }
);

// Update a community
export const updateCommunity = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { name, description, picture, tags } = req.body;

    if (!req.user) {
      return apiResponse(res, 401, { message: "Unauthorized user" });
    }

    const community = await CommunityModel.findById(id);

    if (!community) {
      return apiResponse(res, 404, { message: "Community not found" });
    }

    if (community.createdBy.toString() !== req.user.id.toString()) {
      return apiResponse(res, 403, {
        message: "You do not have permission to update this community",
      });
    }

    const tagDocs = tags
      ? await getOrCreateTags(tags)
      : (community.tags as ITag[]);

    community.name = name || community.name;
    community.description = description || community.description;
    community.picture = picture || community.picture;
    community.tags = tagDocs.map((tag) => tag._id);

    await community.save();

    return apiResponse(res, 200, {
      message: "Community updated successfully",
      data: community,
    });
  }
);

// Delete a community
export const deleteCommunity = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!req.user) {
      return apiResponse(res, 401, { message: "Unauthorized user" });
    }

    const community = await CommunityModel.findById(id);

    if (!community) {
      return apiResponse(res, 404, { message: "Community not found" });
    }

    if (community.createdBy.toString() !== req.user.id.toString()) {
      return apiResponse(res, 403, {
        message: "You do not have permission to delete this community",
      });
    }

    await community.deleteOne();

    return apiResponse(res, 200, { message: "Community deleted successfully" });
  }
);

// Add a member to a community
export const addMemberToCommunity = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!req.user) {
      return apiResponse(res, 401, { message: "Unauthorized user" });
    }

    const community = await CommunityModel.findById(id);

    if (!community) {
      return apiResponse(res, 404, { message: "Community not found" });
    }

    if (community.members.includes(req.user.id)) {
      return apiResponse(res, 400, {
        message: "User is already a member of this community",
      });
    }

    community.members.push(req.user.id);

    await community.save();

    return apiResponse(res, 200, {
      message: "Added to community successfully",
      data: community,
    });
  }
);

// Subscribe to a community
export const subscribeToCommunity = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!req.user) {
      return apiResponse(res, 401, { message: "Unauthorized user" });
    }

    const community = await CommunityModel.findById(id);

    if (!community) {
      return apiResponse(res, 404, { message: "Community not found" });
    }

    if (community.subscribers.includes(req.user.id)) {
      return apiResponse(res, 400, {
        message: "User is already subscribed to this community",
      });
    }

    community.subscribers.push(req.user.id);

    await community.save();

    return apiResponse(res, 200, {
      message: "Subscribed to community successfully",
      data: community,
    });
  }
);
