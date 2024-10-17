import { authMiddleware } from "../middleware/auth.middleware";
import { Router } from "express";
import { createEvent, updateEvent, deleteEvent, listEvents, viewEvent } from "../controllers/event.controller";

export const eventRouter=():Router=>{
    const router=Router();
    router.post("/",createEvent);
    router.put("/:id", updateEvent);
    router.delete("/:id", deleteEvent);
    router.get("/", listEvents);
    router.get("/:id", viewEvent);
    return router;
};