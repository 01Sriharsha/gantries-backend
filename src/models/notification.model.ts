import mongoose, { Schema, Document, Model } from "mongoose";

// NotificationType.ts
export enum NotificationType {
  COMMENT = "COMMENT",
  LIKE = "LIKE",
  NEW_POST = "NEW_POST",
  FOLLOW = "FOLLOW",
  FRIEND_REQUEST = "FRIEND_REQUEST",
  FRIEND_ACCEPT = "FRIEND_ACCEPT",
  OTHER = "OTHER",
}

// Define the Notification Document Interface
export interface INotification extends Document {
  message: string;
  type: NotificationType;
  createdAt: Date;
  read: boolean;
  userId: mongoose.Schema.Types.ObjectId; // Reference to the user who receives the notification
}

// Notification Schema
const NotificationSchema: Schema = new Schema<INotification>({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: Object.values(NotificationType),
    default: NotificationType.OTHER,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  read: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User", // Assuming you have a User model
    required: true,
  },
});

// Create the Notification model
export const NotificationModel: Model<INotification> =
  mongoose.model<INotification>("Notification", NotificationSchema);
