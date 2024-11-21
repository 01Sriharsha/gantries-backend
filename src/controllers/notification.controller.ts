import { NotificationModel } from "../models/notification.model";
import { AuthRequest } from "../types";
import { apiResponse } from "../util/api-response";
import { asyncHandler } from "../util/async-handler";

export const getAllNotificationsOfUser = asyncHandler(
  async (req: AuthRequest, res) => {
    if (req.user) {
      const userId = req.user.id;
      const limit = parseInt(req.query?.limit?.toString()) || 10;
      const notifications = await NotificationModel.find({ userId })
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();

      return apiResponse(res, 200, {
        message: "fetched notifications",
        data: notifications,
      });
    }
  }
);

export const readAllNotifications = asyncHandler(
  async (req: AuthRequest, res) => {
    if (req.user) {
      const ack = await NotificationModel.updateMany(
        { userId: req.user.id },
        { read: true }
      );

      if (ack.acknowledged) {
        return apiResponse(res, 200, { message: "All notifications are read" });
      }
    }
  }
);
