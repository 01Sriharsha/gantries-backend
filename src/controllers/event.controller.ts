import { eventModel } from "../models/event.model";
import { Request,Response } from "express";
import { asyncHandler } from "../util/async-handler";
import { apiResponse } from "../util/api-response";
import { AuthRequest } from "../types";
import { paginate } from "../util/paginate";

// create an event
export const createEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { title, content, eventDate, place, topic, status } = req.body;
    if(!req.user){
        return apiResponse(res,401,{message:"Unauthorized user"})
    }
    
    const event = await eventModel.create({
        title,
        content,
        createdBy: req.user.id, // Assuming user is authenticated and available in req.user
        eventDate,
        place,
        topic,
        status
    });

    return apiResponse(res, 201, {message:"Event created successfully",data:event});
});

//list all the users based on the filter

export const listEvents = asyncHandler(async (req: Request, res: Response) => {
    const { date, place, topic, status,page=1,limit=20} = req.query;

    
    // Build a filter object based on query parameters
    const filters: any = {};

    if (date) {
        filters.eventDate = new Date(date as string);
    }
    
    if (place) {
        filters.place = place.toString().toLowerCase().trim(); 
    }
    
    if (topic) {
        filters.topic = topic.toString(); 
    }
    
    if (status) {
        filters.status = status.toString(); // Match the status
    }
    const paginationParams={
        page:Number(page),
        limit:Number(limit)||20,
    };
    const populateOptions = [
        { path: 'createdBy', select: 'name email' },  
        { path: 'topic', select: 'name' }             
    ];
    const paginatedEvent= await paginate(eventModel,filters,paginationParams,populateOptions);
    return apiResponse(res, 200, {message:"Events fetched successfully", 
        data:{
            events: paginatedEvent.data,
            currentPage: paginatedEvent.currentPage,
            totalPages: paginatedEvent.totalPages,
            totalItems: paginatedEvent.totalItems,
        }
    });
    
});

//update an event
export const updateEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { title, content, eventDate, place, topic, status } = req.body;

    // Find and update event
    const event = await eventModel.findByIdAndUpdate(
        id,
        { title, content, eventDate, place, topic, status },
        { new: true, runValidators: true }
    );

    if (!event) {
        return apiResponse(res, 404, {message:"Event not found"});
    }

    return apiResponse(res, 200, {message:"Event updated successfully",data: event});
});

// View Single Event
export const viewEvent = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    
    const event = await eventModel.findById(id).populate("createdBy", "name email"); // Populating user details if necessary

    if (!event) {
        return apiResponse(res, 404, {message:"Event not found"});
    }

    return apiResponse(res, 200, {message:"Event fetched successfully",data: event});
});

// delete an event
export const deleteEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    
    const event = await eventModel.findByIdAndDelete(id);

    if (!event) {
        return apiResponse(res, 404, {message:"Event not found"});
    }

    return apiResponse(res, 200, {message:"Event deleted successfully"});
});