// src/controllers/friendRequestController.ts
import { Request, Response } from 'express';
import { FriendRequest, IFriendRequest } from '../models/friendrequests.model';
import { Types } from 'mongoose';
import { asyncHandler } from "../util/async-handler";
import { AuthRequest } from "../types";
import { apiResponse } from "../util/api-response";
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

    res.status(200).json(requests);
    return apiResponse(res,200,{data:requests});
  } catch (error) {
    // console.error('Error fetching friend requests:', error);
    return apiResponse(res,500,{message:'Failed to fetch friend requests'})
  }
});
