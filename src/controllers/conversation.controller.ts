import { Request, Response } from "express";
import { conversationModel } from "../models/conversation.model";
import { apiResponse } from "../util/api-response";
import { asyncHandler } from "../util/async-handler";
import { AuthRequest } from "../types";
import { IUser, UserModel } from "../models/user.model";
import mongoose, { ObjectId } from "mongoose";
import { MessageModel } from "../models/message.model";
export const createConversation = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return apiResponse(res, 401, { message: "Unauthorized user" });
    }
    const { participants } = req.body;
    const conversationPair = [participants, req.user.id];
    const newConversation = new conversationModel({
      participants: conversationPair,
    });
    await newConversation.save();
    return apiResponse(res, 201, {
      message: "conversation added successfully",
    });
  }
);

export const getConversation = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const conversations = await conversationModel
      .find({ participants: req.user.id }) // Ensure req.user.id is the correct type
      .populate("participants", "username email")
      .exec();

    if (!conversations.length) {
      return apiResponse(res, 200, {
        message: "No conversations found for this user",
        data: [],
      });
    }

    // Convert req.user.id to ObjectId if necessary
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const conversationData = await Promise.all(
      conversations.map(async (conversation) => {
        const otherParticipants = conversation.participants.filter(
          (participant: IUser) => participant._id !== userId
        );

        // Find the last message for this conversation
        const lastMessage = await MessageModel.findOne({
          conversationId: conversation._id,
        })
          .sort({ sentAt: -1 }) // Get the most recent message
          .select("content sentAt")
          .exec();

        return {
          participants: otherParticipants.map((participant: IUser) => ({
            _id: participant._id,
            username: participant.username,
            email: participant.email,
          })),
          lastMessage: lastMessage ? lastMessage.content : null,
          lastMessageTime: lastMessage ? lastMessage.sentAt : null,
        };
      })
    );

    return apiResponse(res, 200, { data: conversationData });
  }
);
