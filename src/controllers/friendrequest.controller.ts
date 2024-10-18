// src/controllers/friendRequestController.ts
import { Request, Response } from 'express';
import { FriendRequest} from '../models/friendrequests.model';
import { Types } from 'mongoose';
import { asyncHandler } from "../util/async-handler";
import { AuthRequest } from "../types";
import { apiResponse } from "../util/api-response";
import { Friends } from "../models/friends.model";
import { UserModel } from "../models/user.model";
// Create a new friend request
export const createFriendRequest =asyncHandler( async (req: AuthRequest, res: Response)=> {
    try {
      const sender = req.user.id; // Extract sender ID from authenticated user
      const { receiver } = req.body; // Extract receiver ID from request body
  
      if (!sender || !Types.ObjectId.isValid(receiver)) {
        return apiResponse(res,400,{ message: "Invalid sender or receiver ID." });
      }
      // Create and save a new friend request
      const friendRequest = new FriendRequest({
        sender:sender,
        receiver:receiver,
      });

      await friendRequest.save();
      return apiResponse(res,201,{message:"Friend request sent successfully"});
    } catch (error) {
    //   console.error('Error creating friend request:', error);
      return apiResponse(res,500,{message:'Failed to create friend request.'})
    }
  });

// Get all friend requests for a specific user
export const getFriendRequestsForUser =asyncHandler( async (req: AuthRequest, res: Response) => {
  const userId  = req.user.id;
  try {
    const requests = await FriendRequest.find({ receiver: userId })
      .populate('sender', 'name email') // Optionally populate sender details
      .exec();

    return apiResponse(res,200,{data:requests});
  } catch (error) {
    // console.error('Error fetching friend requests:', error);
    return apiResponse(res,500,{message:'Failed to fetch friend requests'})
  }
});

//get friends
export const getUserFriends =asyncHandler( async (req: AuthRequest, res: Response) => {
  try {
      const userId  = req.user.id;

      // Find the document by userId
      const friendsList = await Friends.findOne({ userId }).exec();

      if (!friendsList) {
          return apiResponse(res,404,{ message: "User's friends not found" });
      }

      return apiResponse(res,200,{data:friendsList.friends});
  } catch (error) {
      // console.error("Error fetching user friends:", error);
      return apiResponse(res,500,{ message: "Server error" })
  }
});


// Accept a friend request and delete it from the collection
export const acceptFriendRequest =asyncHandler( async (req: AuthRequest, res: Response) => {
  try {
      const { requestId } = req.params;

      // Find and delete the friend request
      const friendRequest = await FriendRequest.findByIdAndDelete(requestId);
      if (!friendRequest) {
          return apiResponse(res,404,{ message: "Friend request not found" });
      }

      const { sender, receiver } = friendRequest;

      // Fetch sender and receiver names
      const [senderUser, receiverUser] = await Promise.all([
          UserModel.findById(sender).select("username"),
          UserModel.findById(receiver).select("username"),
      ]);

      if (!senderUser || !receiverUser) {
          return apiResponse(res,404,{message: "User not found" });
      }

      // Update both users' friends lists
      await Promise.all([
          Friends.updateOne(
              { userId: sender },
              { $push: { friends: { friendId: receiver, name: receiverUser.username } } },
              { upsert: true }
          ),
          Friends.updateOne(
              { userId: receiver },
              { $push: { friends: { friendId: sender, name: senderUser.username } } },
              { upsert: true }
          ),
      ]);

      // Send response with receiver's name (who accepted the request)
      return apiResponse(res,200,{ message: `${receiverUser.username} accepted the friend request.`});
  } catch (error) {
      // console.error("Error accepting friend request:", error);
      return apiResponse(res,500,{ message: "Server error" });
  }
});

// Reject a friend request and delete it from the collection
export const rejectFriendRequest =asyncHandler( async (req: AuthRequest, res: Response) => {
  try {
      const { requestId } = req.params;

      // Find and delete the friend request
      const friendRequest = await FriendRequest.findByIdAndDelete(requestId);
      if (!friendRequest) {
          return apiResponse(res,404,{ message: "Friend request not found" });
      }

      const { sender, receiver } = friendRequest;

      // Fetch the receiver's name (who rejected the request)
      const receiverUser = await UserModel.findById(receiver).select("username");
      if (!receiverUser) {
          return apiResponse(res,404,{ message: "User not found" });
      }

      // Send response with the receiver's name
      return apiResponse(res,200,{message:`${receiverUser.username} rejected the friend request.`});
  } catch (error) {
      // console.error("Error rejecting friend request:", error);
      return apiResponse(res,500,{ message: "Server error" });
  }
});