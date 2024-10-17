import { Schema, model, Document } from "mongoose";
import { IUser } from "./user.model";
import { ITag } from "../models/tag.model";
import { string } from "zod";
interface IEvent extends Document{
    title:string;
    content:string;
    createdBy:IUser["_id"];
    date:Date;
    eventDate:Date;
    place:string;
    topic:ITag["_id"][];
    status:'Online'|'Offline';
}

const eventSchema=new Schema<IEvent>(
    {
        title:{
            type:String,
            required:true,
        },
        content:{
            type:String,
            required:true,
        },
        createdBy:{
            type:Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        date:{
            type:Date,
            default:Date.now,
        },
        eventDate:{
            type:Date,
            required:true,
        },
        place:{
            type:String,
            trim:true,
            required:true,
            lowercase:true,
        },
        topic:[
            {
            type:Schema.Types.ObjectId,
            ref:'Tag',
            }
        ],
        status:{
            type:String,
            enum:['Online','Offline'],
            default:'Online'
        }


    },{
        timestamps:true
    }
);
export const eventModel=model<IEvent>("Event",eventSchema);

