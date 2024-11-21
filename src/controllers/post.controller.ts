import { Request, Response } from "express";
import { PostModel } from "../models/post.model";
import { CommunityModel } from "../models/community.model";
import { AuthRequest } from "../types";
import { apiResponse } from "../util/api-response";
import { asyncHandler } from "../util/async-handler";
import { getOrCreateTags } from "../util/helper";
import { ITag } from "../models/tag.model";
import { PopulateOptions } from "mongoose";
import { paginate } from "../util/paginate";

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
export const getAllPosts = asyncHandler(async (req : AuthRequest, res: Response) => {
  // const posts = await PostModel.find()
  //   .populate("createdBy", "_id firstname lastname email")
  //   .populate("community", "_id name description");

  const { page = 1, limit = 10 } = req.query;

  const populateOptions: Array<string | PopulateOptions> = [
    { path: "createdBy", select: "_id username email" },
    { path: "community", select: "_id name picture" },
    { path: "tags", select: "name" },
  ];

  const paginationResult = await paginate(
    PostModel, //model to fetch from..
    {}, //based on what to fetch
    { page: Number(page), limit: Number(limit) }, //paginate params
    populateOptions //populate necessary fields
  );

  const postsArr = [];
  const posts = paginationResult.data;
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    let response = { ...post.toObject(), isLiked: false };

    console.log("user" , req.user);
    

    if (req.user) {
      console.log("logged in");
      
      const isLiked = post.likes.includes(req.user.id);
      response = { ...response, isLiked };
      console.log({response});
    }
    
    postsArr.push(response);
  }

  paginationResult.data = postsArr;

  return apiResponse(res, 200, { message: "", data: paginationResult });
});

// Get all posts by communityId
export const getAllPostsByCommunity = asyncHandler(
  async (req, res: Response) => {
    const { communityId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const community = await CommunityModel.findById(communityId);
    if (!community) {
      return apiResponse(res, 404, { message: "Community not found" });
    }
    // const posts = await PostModel.find({ community: communityId })
    //   .populate("createdBy", "_id firstname lastname email")
    //   .populate("createdBy", "_id username email")
    //   .populate("community", "_id name picture")
    //   .populate("tags", "name");

    const populateOptions: Array<string | PopulateOptions> = [
      { path: "createdBy", select: "_id username email" },
      { path: "community", select: "_id name picture" },
      { path: "tags", select: "name" },
    ];

    const paginationResult = await paginate(
      PostModel, //model to fetch from..
      { community: communityId }, //based on what to fetch
      { page: Number(page), limit: Number(limit) }, //paginate params
      populateOptions //populate necessary fields
    );

    const postsArr = [];
    const posts = paginationResult.data;
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      let response = { ...post.toObject(), isLiked: false };
      if (req.user) {
        const isLiked = post.likes.includes(req.user.id);
        response = { ...response, isLiked };
      }
      postsArr.push(response);
    }

    paginationResult.data = postsArr;

    return apiResponse(res, 200, { message: "", data: paginationResult });
  }
);

// Get a post by ID
export const getPostById = asyncHandler(async (req, res: Response) => {
  const { id } = req.params;

  const post = await PostModel.findById(id)
    .populate("createdBy", "_id username email")
    .populate("community", "_id name picture")
    .populate("tags", "name");

  if (!post) {
    return apiResponse(res, 404, { message: "Post not found" });
  }

  let response = { ...post.toObject(), isLiked: false };

  if (req.user) {
    const isLiked = post.likes.includes(req.user.id);
    response = { ...response, isLiked };
    console.log("isLiked", response.isLiked);
  }

  return apiResponse(res, 200, { data: response });
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

export const toggleLikePost = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    console.log(id);
    

    if (!req.user) {
      return apiResponse(res, 401, { message: "Unauthorized user" });
    }

    const post = await PostModel.findById(id);

    if (!post) {
      return apiResponse(res, 404, { message: "Post not found" });
    }

    let isLiked = post.likes.includes(req.user.id);

    if (isLiked) {
      // Unlike the post
      const filtered = post.likes.filter(
        (like) => like.toString() !== req.user.id.toString()
      );
      post.likes = filtered;
      isLiked = false;
    } else {
      // Like the post
      post.likes.push(req.user.id);
      isLiked = true;
    }

    post.likeCount = post.likes.length;
    await post.save();

    return apiResponse(res, 200, {
      message: `Post ${isLiked ? "Liked" : "Unliked"} successfully`,
      data: { ...post, isLiked },
    });
  }
);
