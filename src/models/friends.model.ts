import { Schema, Document,model} from "mongoose";
import { IUser } from "./user.model";


// Define the Friend interface for individual friend data
interface IFriend {
    friendId: IUser["_id"]; // Friend's User ID
    name: string; // Friend's name
}

// Define the Friends schema interface for the collection
export interface IFriends extends Document {
    userId: IUser["_id"]; // The ID of the current user
    friends: IFriend[]; // List of friends
}

// Create the Friends schema
const FriendsSchema = new Schema<IFriends>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    friends: [
        {
            friendId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        },
    ],
});

// Export the Friends model
export const Friends = model<IFriends>("Friends", FriendsSchema);
