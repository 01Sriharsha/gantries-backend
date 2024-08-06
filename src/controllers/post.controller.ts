import { Request, Response } from "express";
import { PostModel } from "../models/post.model";
import { CommunityModel } from "../models/community.model";
import { AuthRequest } from "../types";
import { apiResponse } from "../util/api-response";
import { asyncHandler } from "../util/async-handler";
import { getOrCreateTags } from "../util/helper";
import { ITag } from "../models/tag.model";

// Create a new post
export const createPost = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { title, content, communityId, images, tags } = req.body;

    if (!req.user) {
      return apiResponse(res, 401, { message: "Unauthorized user" });
    }

    const community = await CommunityModel.findById(communityId);
    if (!community) {
      return apiResponse(res, 404, { message: "Community not found" });
    }

    const tagDocs = await getOrCreateTags(tags);

    const post = new PostModel({
      title,
      content,
      community: communityId,
      createdBy: req.user.id,
      images,
      likeCount: 0,
      tags: tagDocs.map((tag) => tag._id),
    });

    await post.save();

    return apiResponse(res, 201, {
      message: "Post created successfully",
      data: post,
    });
  }
);

// Get all posts
export const getAllPosts = asyncHandler(async (req: Request, res: Response) => {
  const posts = await PostModel.find()
    .populate("createdBy", "_id firstname lastname email")
    .populate("community", "_id name description");

  return apiResponse(res, 200, { message: "", data: posts });
});

// Get all posts by communityId
export const getAllPostsByCommunity = asyncHandler(
  async (req: Request, res: Response) => {
    const { communityId } = req.params;
    const community = await CommunityModel.findById(communityId);
    if (!community) {
      return apiResponse(res, 404, { message: "Community not found" });
    }
    const posts = await PostModel.find({ community: communityId }).populate(
      "createdBy",
      "_id firstname lastname email"
    );

    return apiResponse(res, 200, { message: "", data: posts });
  }
);

// Get a post by ID
export const getPostById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const post = await PostModel.findById(id)
    .populate("createdBy", "_id firstname lastname email")
    .populate("community", "_id name description");

  if (!post) {
    return apiResponse(res, 404, { message: "Post not found" });
  }

  return apiResponse(res, 200, { data: post });
});

// Update a post
export const updatePost = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { title, content, images, tags } = req.body;

    if (!req.user) {
      return apiResponse(res, 401, { message: "Unauthorized user" });
    }

    const post = await PostModel.findById(id);

    if (!post) {
      return apiResponse(res, 404, { message: "Post not found" });
    }

    if (post.createdBy.toString() !== req.user.id.toString()) {
      return apiResponse(res, 403, {
        message: "You do not have permission to update this post",
      });
    }

    const tagDocs = tags ? await getOrCreateTags(tags) : (post.tags as ITag[]);

    post.title = title || post.title;
    post.content = content || post.content;
    post.images = images || post.images;
    post.tags = tagDocs.map((tag) => tag._id);

    await post.save();

    return apiResponse(res, 200, {
      message: "Post updated successfully",
      data: post,
    });
  }
);

// Delete a post
export const deletePost = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!req.user) {
      return apiResponse(res, 401, { message: "Unauthorized user" });
    }

    const post = await PostModel.findById(id);

    if (!post) {
      return apiResponse(res, 404, { message: "Post not found" });
    }

    if (post.createdBy.toString() !== req.user.id.toString()) {
      return apiResponse(res, 403, {
        message: "You do not have permission to delete this post",
      });
    }

    await post.deleteOne();

    return apiResponse(res, 200, { message: "Post deleted successfully" });
  }
);

// Like a post
export const likePost = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!req.user) {
      return apiResponse(res, 401, { message: "Unauthorized user" });
    }

    const post = await PostModel.findById(id);

    if (!post) {
      return apiResponse(res, 404, { message: "Post not found" });
    }

    if (post.likes.includes(req.user.id)) {
      return apiResponse(res, 400, { message: "Post already liked" });
    }

    post.likes.push(req.user.id);
    post.likeCount = post.likes.length;

    await post.save();

    return apiResponse(res, 200, {
      message: "Post liked successfully",
      data: post,
    });
  }
);

// Unlike a post
export const unlikePost = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!req.user) {
      return apiResponse(res, 401, { message: "Unauthorized user" });
    }

    const post = await PostModel.findById(id);

    if (!post) {
      return apiResponse(res, 404, { message: "Post not found" });
    }

    if (!post.likes.includes(req.user.id)) {
      return apiResponse(res, 400, { message: "Post not liked yet" });
    }

    post.likes = post.likes.filter(
      (like) => like.toString() !== req.user.id.toString()
    );
    post.likeCount = post.likes.length;

    await post.save();

    return apiResponse(res, 200, {
      message: "Post unliked successfully",
      data: post,
    });
  }
);
