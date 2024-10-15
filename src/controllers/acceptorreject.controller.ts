import { Request, Response } from "express";
import { FriendRequest } from "../models/friendrequests.model";
import { Friends } from "../models/friends.model";
import { UserModel } from "../models/user.model"; // Import User model
import { asyncHandler } from "../util/async-handler";
import { AuthRequest } from "../types";
import { apiResponse } from "../util/api-response";

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
