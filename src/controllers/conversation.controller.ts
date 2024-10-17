import {Request,Response} from "express";
import { conversationModel } from "../models/conversation.model";
import { apiResponse } from "../util/api-response";
import { asyncHandler } from "../util/async-handler";
import { AuthRequest } from "../types";
import { UserModel } from "../models/user.model";
import mongoose, { ObjectId } from "mongoose";
export const createConversation=asyncHandler(
    async(req:AuthRequest,res:Response)=>{
        if(!req.user){
            return apiResponse(res,401,{message:"Unauthorized user"})
        }
        const {participants}=req.body;
        const conversationPair=[participants,req.user.id];
        const newConversation = new conversationModel({ participants:conversationPair });
        await newConversation.save();
        return apiResponse(res,201,{message:"conversation added successfully"});

    }
)

export const getConversation=asyncHandler(
    async(req:AuthRequest,res:Response)=>{
        
        
        const conversations=await conversationModel.find({participants:req.user.id}).populate('participants','username');
        if(!conversations.length){
            return apiResponse(res,404,{message:'No conversations found for this user'});
        }
        const userIds = new Set<mongoose.Types.ObjectId>();

        conversations.forEach(conversation => {
          conversation.participants.forEach(participant => {
            // Ensure that both participant and req.user._id are ObjectIds and compare
            const participantId = new mongoose.Types.ObjectId(participant as string);
            if (!participantId.equals(req.user.id)) {
              // Add the participant's ObjectId to the Set
              userIds.add(participantId);
            }
          });
        });
        
        // Convert the Set of ObjectIds to an array
        const userIdsArray = Array.from(userIds);
        
        // Query the UserModel using the ObjectId array
        const users = await UserModel.find(
          { _id: { $in: userIdsArray } },  // Use the array of ObjectIds
          'username picture'  // Select only 'username' and 'picture' fields
        );
        return apiResponse(res,200,{data:users});
    }
);