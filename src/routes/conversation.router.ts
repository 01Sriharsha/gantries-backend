import { authMiddleware } from "../middleware/auth.middleware";
import { Router } from "express";
import { getConversation,createConversation } from "../controllers/conversation.controller";

export const conversationRouter=(): Router =>{
    const router=Router();
    router.post("/",authMiddleware,createConversation);
    router.get("/",authMiddleware,getConversation);
    return router;

};