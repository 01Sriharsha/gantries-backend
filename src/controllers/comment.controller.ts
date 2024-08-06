import { Request, Response } from "express";
import { CommentModel } from "../models/comment.model";
import { PostModel } from "../models/post.model";
import { AuthRequest } from "../types";
import { apiResponse } from "../util/api-response";
import { asyncHandler } from "../util/async-handler";

// Create a new comment
export const createComment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { postId, content } = req.body;

    if (!req.user) {
      return apiResponse(res, 401, { message: "Unauthorized user" });
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return apiResponse(res, 404, { message: "Post not found" });
    }

    const comment = new CommentModel({
      content,
      post: postId,
      createdBy: req.user.id,
    });

    await comment.save();
    post.comments.push(comment.id);
    await post.save();

    return apiResponse(res, 201, {
      message: "Comment created successfully",
      data: comment,
    });
  }
);

// Get all comments by post ID
export const getCommentsByPostId = asyncHandler(
  async (req: Request, res: Response) => {
    const { postId } = req.params;

    const comments = await CommentModel.find({ post: postId })
      .populate("createdBy", "_id firstname lastname email")
      .populate("post", "_id title content");

    return apiResponse(res, 200, { data: comments });
  }
);

// Update a comment
export const updateComment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { content } = req.body;

    if (!req.user) {
      return apiResponse(res, 401, { message: "Unauthorized user" });
    }

    const comment = await CommentModel.findById(id);

    if (!comment) {
      return apiResponse(res, 404, { message: "Comment not found" });
    }

    if (comment.createdBy.toString() !== req.user.id.toString()) {
      return apiResponse(res, 403, {
        message: "You do not have permission to update this comment",
      });
    }

    comment.content = content || comment.content;

    await comment.save();

    return apiResponse(res, 200, {
      message: "Comment updated successfully",
      data: comment,
    });
  }
);

// Delete a comment
export const deleteComment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!req.user) {
      return apiResponse(res, 401, { message: "Unauthorized user" });
    }

    const comment = await CommentModel.findById(id);

    if (!comment) {
      return apiResponse(res, 404, { message: "Comment not found" });
    }

    if (comment.createdBy.toString() !== req.user.id.toString()) {
      return apiResponse(res, 403, {
        message: "You do not have permission to delete this comment",
      });
    }

    await comment.deleteOne();

    return apiResponse(res, 200, { message: "Comment deleted successfully" });
  }
);

// Reply to a comment
export const replyToComment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params; // id of the comment being replied to
    const { content } = req.body;

    if (!req.user) {
      return apiResponse(res, 401, { message: "Unauthorized user" });
    }

    const parentComment = await CommentModel.findById(id);
    if (!parentComment) {
      return apiResponse(res, 404, { message: "Comment not found" });
    }

    const reply = new CommentModel({
      content,
      post: parentComment.post,
      createdBy: req.user.id,
      parent: parentComment.id,
    });

    await reply.save();
    parentComment.replies.push(reply.id);
    await parentComment.save();

    return apiResponse(res, 201, {
      message: "Reply added successfully",
      data: reply,
    });
  }
);

// Get replies for a comment
export const getRepliesForComment = asyncHandler(
  async (req: Request, res: Response) => {
    const { commentId } = req.params;

    const replies = await CommentModel.find({ parent: commentId }).populate(
      "createdBy",
      "_id firstname lastname email"
    );

    return apiResponse(res, 200, { data: replies });
  }
);
