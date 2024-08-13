import { Request, Response } from "express";
import { CommunityModel } from "../models/community.model";
import { AuthRequest } from "../types";
import { apiResponse } from "../util/api-response";
import { asyncHandler } from "../util/async-handler";
import { getOrCreateTags } from "../util/helper";
import { ITag } from "../models/tag.model";
import { PostModel } from "../models/post.model";

// Create a new community
export const createCommunity = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { name, description, picture, tags } = req.body;

    if (!req.user) {
      return apiResponse(res, 401, { message: "Unauthorized user" });
    }
    let tagDocs = [];
    if (tags?.length > 0) {
      tagDocs = await getOrCreateTags(tags);
    }

    const existingCommunity = await CommunityModel.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") }, //check for case sensitivity
    });

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
export const getAllCommunities = asyncHandler(async (req, res: Response) => {
  const communitiesQuery = CommunityModel.find()
    .populate("createdBy", "_id username email picture")
    .populate("tags", "_id name"); // Use lean to get plain JavaScript objects

  const communities = await communitiesQuery.exec();

  const communitiesArr = [];
  for (let i = 0; i < communities.length; i++) {
    const community = communities[i];
    const postsCount = await PostModel.countDocuments({
      community: community._id,
    });

    // Add counts to the community object
    let communityWithCounts = {
      ...community.toObject(),
      subscribersCount: community.subscribers.length,
      membersCount: community.members.length,
      postsCount: postsCount,
      isSubscribed: false,
    };

    // Add isSubscribed only if userId is available
    if (req.user) {
      const isSubscribed = community.subscribers.includes(req.user.id);
      communityWithCounts = { ...communityWithCounts, isSubscribed };
    }

    communitiesArr.push(communityWithCounts);
  }

  return apiResponse(res, 200, { data: communitiesArr });
});

// Get a community by ID
export const getCommunityById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const community = await CommunityModel.findById(id)
      .populate("createdBy", "_id username email picture")
      .populate("members", "_id username email picture")
      .populate("subscribers", "_id username email picture")
      .populate("tags", "_id name");

    if (!community) {
      return apiResponse(res, 404, { message: "Community not found" });
    }

    return apiResponse(res, 200, { data: community });
  }
);

// Get a community by name
export const getCommunityByName = asyncHandler(async (req, res) => {
  const { name } = req.params;

  const community = await CommunityModel.findOne({ name })
    .populate("createdBy", "_id username email picture")
    .populate("tags", "_id name");

  if (!community) {
    return apiResponse(res, 404, { message: "Community not found" });
  }

  const postsCount = await PostModel.countDocuments({
    community: community._id,
  });

  // Add counts to the community object
  let communityWithCounts = {
    ...community.toObject(),
    subscribersCount: community.subscribers.length,
    membersCount: community.members.length,
    postsCount: postsCount,
    isSubscribed: false,
  };

  // Add isSubscribed only if userId is available
  if (req.user) {
    const isSubscribed = community.subscribers.includes(req.user.id);
    communityWithCounts = { ...communityWithCounts, isSubscribed };
  }

  return apiResponse(res, 200, { data: communityWithCounts });
});

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

    const isSubscribed = community.subscribers.includes(req.user.id);
    let message: string;

    if (isSubscribed) {
      const filtered = community.subscribers.filter(
        (subscriberId) => subscriberId.toString() === req.user.id
      );
      community.subscribers = filtered;

      message = "Unsubscribed successfully";
    } else {
      community.subscribers.push(req.user.id);
      message = "Subscribed to community successfully";
    }

    await community.save();

    return apiResponse(res, 200, { message, data: community });
  }
);

export const isSubscribed = asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    return apiResponse(res, 401, { message: "Unauthorized user" });
  }
  const { id } = req.params;
  const community = await CommunityModel.findById(id);
  const isSubscribed = community.subscribers.includes(req.user.id);
  return apiResponse(res, 200, { data: isSubscribed });
});
