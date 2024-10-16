import {Request,Response} from "express";
import { conversationModel } from "../models/conversation.model";
import { apiResponse } from "../util/api-response";
import { asyncHandler } from "../util/async-handler";
import { AuthRequest } from "../types";

export const createConversation=asyncHandler(
    async(req:AuthRequest,res:Response)=>{
        if(!req.user){
            return apiResponse(res,401,{message:"Unauthorized user"})
        }
        const {participants}=req.body;
        const newConversation = new conversationModel({ participants:participants });
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
        
        return apiResponse(res,200,{data:conversations});
    }
);