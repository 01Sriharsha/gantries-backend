import { Request, Response } from "express";
import { Friends } from "../models/friends.model";
import { asyncHandler } from "../util/async-handler";
import { AuthRequest } from "../types";
import { apiResponse } from "../util/api-response";


// Get the friends list of a user by userId
export const getUserFriends =asyncHandler( async (req: AuthRequest, res: Response) => {
    try {
        const userId  = req.user.id;

        // Find the document by userId
        const friendsList = await Friends.findOne({ userId }).populate("friends.friendId","username").exec();

        if (!friendsList) {
            return apiResponse(res,404,{ message: "User's friends not found" });
        }

        return apiResponse(res,200,{data:friendsList});
    } catch (error) {
        // console.error("Error fetching user friends:", error);
        return apiResponse(res,500,{ message: "Server error" })
    }
});
