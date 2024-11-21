// src/controllers/friendRequestController.ts
import { Request, Response } from "express";
import { FriendRequest } from "../models/friendrequests.model";
import { Types } from "mongoose";
import { asyncHandler } from "../util/async-handler";
import { AuthRequest } from "../types";
import { apiResponse } from "../util/api-response";
import { Friends } from "../models/friends.model";
import { UserModel } from "../models/user.model";
import {
  NotificationModel,
  NotificationType,
} from "../models/notification.model";
// Create a new friend request
export const createFriendRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    try {
      const sender = req.user;
      const senderId = req.user.id; // Extract sender ID from authenticated user
      const { receiver } = req.body; // Extract receiver ID from request body

      if (!senderId || !Types.ObjectId.isValid(receiver)) {
        return apiResponse(res, 400, {
          message: "Invalid sender or receiver ID.",
        });
      }
      // Create and save a new friend request
      const friendRequest = new FriendRequest({
        sender: senderId,
        receiver: receiver,
      });

      await friendRequest.save();

      //create notification
      const notification = new NotificationModel({
        userId: friendRequest.receiver,
        message: `You have a new friend request from ${sender.username}`,
        type: NotificationType.FRIEND_REQUEST,
      });
      await notification.save();

      return apiResponse(res, 201, {
        message: "Friend request sent successfully",
        data: friendRequest,
      });
    } catch (error) {
      //   console.error('Error creating friend request:', error);
      return apiResponse(res, 500, {
        message: "Failed to create friend request.",
      });
    }
  }
);

// Get all friend requests for a specific user
export const getFriendRequestsForUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;
    try {
      const requests = await FriendRequest.find({ receiver: userId })
        .populate("sender", "_id email username") // Optionally populate sender details
        .exec();

      return apiResponse(res, 200, { data: requests });
    } catch (error) {
      // console.error('Error fetching friend requests:', error);
      return apiResponse(res, 500, {
        message: "Failed to fetch friend requests",
      });
    }
  }
);

//get friends
export const getUserFriends = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.id;

      // Find the document by userId
      const friendsList = await Friends.findOne({ userId })
        .populate("friends.friendId", "_id email username")
        .exec();

      if (!friendsList) {
        return apiResponse(res, 404, { message: "User's friends not found" });
      }

      return apiResponse(res, 200, { data: friendsList.friends });
    } catch (error) {
      // console.error("Error fetching user friends:", error);
      return apiResponse(res, 500, { message: "Server error" });
    }
  }
);

// Accept a friend request and delete it from the collection
export const acceptFriendRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    try {
      const { requestId } = req.params;

      // Find and delete the friend request
      const friendRequest = await FriendRequest.findByIdAndDelete(requestId);
      if (!friendRequest) {
        return apiResponse(res, 404, { message: "Friend request not found" });
      }

      const { sender, receiver } = friendRequest;

      // Fetch sender and receiver names
      const [senderUser, receiverUser] = await Promise.all([
        UserModel.findById(sender).select("username"),
        UserModel.findById(receiver).select("username"),
      ]);

      if (!senderUser || !receiverUser) {
        return apiResponse(res, 404, { message: "User not found" });
      }

      // Update both users' friends lists
      await Promise.all([
        Friends.updateOne(
          { userId: sender },
          {
            $push: {
              friends: { friendId: receiver, name: receiverUser.username },
            },
          },
          { upsert: true }
        ),
        Friends.updateOne(
          { userId: receiver },
          {
            $push: { friends: { friendId: sender, name: senderUser.username } },
          },
          { upsert: true }
        ),
      ]);

      //create notification
      const notification = new NotificationModel({
        userId: senderUser._id,
        message: `${receiverUser.username} has accepted your friend request`,
        type: NotificationType.FRIEND_REQUEST,
      });
      await notification.save();

      // Send response with receiver's name (who accepted the request)
      return apiResponse(res, 200, {
        message: `Accepted the friend request!`,
      });
    } catch (error) {
      // console.error("Error accepting friend request:", error);
      return apiResponse(res, 500, { message: "Server error" });
    }
  }
);

// Reject a friend request and delete it from the collection
export const rejectFriendRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    try {
      const { requestId } = req.params;

      // Find and delete the friend request
      const friendRequest = await FriendRequest.findByIdAndDelete(requestId);
      if (!friendRequest) {
        return apiResponse(res, 404, { message: "Friend request not found" });
      }

      const { sender, receiver } = friendRequest;

      // Fetch the receiver's name (who rejected the request)
      const receiverUser = await UserModel.findById(receiver).select(
        "username"
      );
      if (!receiverUser) {
        return apiResponse(res, 404, { message: "User not found" });
      }

      // Send response with the receiver's name
      return apiResponse(res, 200, {
        message: `${receiverUser.username} rejected the friend request.`,
      });
    } catch (error) {
      // console.error("Error rejecting friend request:", error);
      return apiResponse(res, 500, { message: "Server error" });
    }
  }
);

// Get all unconnected users for the current user
export const getAllUnConnectedUsers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.id;

      // Get users who have no friend request or friendship connection with the current user
      const connectedUserIds = new Set<string>();

      // Fetch all friend connections for the user
      const friendsList = await Friends.findOne({ userId }).exec();
      if (friendsList) {
        friendsList.friends.forEach((friend) =>
          connectedUserIds.add(friend.friendId.toString())
        );
      }

      // Fetch all friend requests where the current user is either sender or receiver
      const friendRequests = await FriendRequest.find({
        $or: [{ sender: userId }, { receiver: userId }],
      }).exec();
      friendRequests.forEach((request) => {
        connectedUserIds.add(request.sender.toString());
        connectedUserIds.add(request.receiver.toString());
      });

      // Find all users except the current user and those in the connectedUserIds set
      const unconnectedUsers = await UserModel.find({
        _id: { $nin: [...connectedUserIds, userId] },
      })
        .select("_id username email")
        .exec();

      // Send the list of unconnected users
      return apiResponse(res, 200, { data: unconnectedUsers });
    } catch (error) {
      // console.error("Error fetching unconnected users:", error);
      return apiResponse(res, 500, { message: "Server error" });
    }
  }
);
