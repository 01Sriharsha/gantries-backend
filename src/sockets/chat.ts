import { Server, Socket } from "socket.io";
import { MessageModel } from "../models/message.model";
import { conversationModel, IConversation } from "../models/conversation.model";

interface UserConnection {
  userId: string;
  socket: Socket;
}

type MessageData = {
  senderId: string;
  recieverId: string;
  content: string;
};

export class ChatSocket {
  private io: Server;
  private userConnections: Map<string, UserConnection>;

  constructor(httpServer: any) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
      },
    });
    this.userConnections = new Map();

    this.io.on("connection", (socket: Socket) => {
      console.log("Connected", this.userConnections[0]);

      const userId = socket.handshake.query.userId as string;

      if (userId) {
        this.userConnections.set(userId, { userId, socket });
        console.log(`User connected: ${userId}`);

        socket.on("disconnect", () => {
          this.userConnections.delete(userId);
          console.log(`User disconnected: ${userId}`);
        });

        this.handleIncomingMessages(socket, userId);
      }
    });
  }

  private handleIncomingMessages(socket: Socket, userId: string) {
    // Send message to the receiver
    socket.on("sendMessage", async (messageData) => {
      try {
        const { senderId, recieverId, content } = messageData as MessageData;

        // Validate input data
        if (!senderId || !recieverId || !content) {
          return socket.emit("error", { message: "Invalid data" });
        }

        // Check for an existing conversation between participants
        let conversation = await conversationModel.findOne({
          participants: { $all: [senderId, recieverId] }, // Use $all for better matching
        });

        // Create a new conversation if it doesn't exist
        if (!conversation) {
          conversation = new conversationModel({
            participants: [senderId, recieverId],
          });
          await conversation.save();
        }

        // Create and save the new message
        const newMessage = new MessageModel({
          conversationId: conversation._id,
          senderId,
          recieverId,
          content,
          createdAt: new Date(),
        });
        await newMessage.save();

        const MessageResponse = {
          content: newMessage.content,
          sentAt: newMessage.sentAt,
          _id: newMessage._id,
          senderId,
          recieverId,
        };

        // Emit the new message to the receiver if connected
        const receiverConnection = this.userConnections.get(recieverId);
        if (receiverConnection) {
          receiverConnection.socket.emit("newMessage", MessageResponse);
        }

        //this is for sender
        socket.emit("messageSent", MessageResponse);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Fetch all messages between users
    socket.on("getMessages", async (conversationData) => {
      const { senderId, recieverId } = conversationData as Partial<MessageData>;

      try {
        const messages = await MessageModel.find({
          $or: [
            { senderId, recieverId },
            { senderId: recieverId, recieverId: senderId },
          ],
        })
          .select("content sentAt senderId recieverId")
          .sort({ sentAt: 1 });
        // console.log(messages)
        socket.emit("allMessages", messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
        socket.emit("error", { message: "Failed to fetch messages" });
      }
    });
  }

  public start() {
    console.log("Socket.IO server is ready to accept connections.");
  }
}
