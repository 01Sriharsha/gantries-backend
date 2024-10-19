import { Server, Socket } from 'socket.io';
import { MessageModel } from '../models/message.model';

interface UserConnection {
  userId: string;
  socket: Socket;
}

export class ChatSocket {
  private io: Server;
  private userConnections: Map<string, UserConnection>;

  constructor(httpServer: any) {
    this.io = new Server(httpServer, {
      cors: {
        origin: '*', 
      },
    });
    this.userConnections = new Map();

    this.io.on('connection', (socket: Socket) => {
      const userId = socket.handshake.query.userId as string;

      if (userId) {
        this.userConnections.set(userId, { userId, socket });
        console.log(`User connected: ${userId}`);

        socket.on('disconnect', () => {
          this.userConnections.delete(userId);
          console.log(`User disconnected: ${userId}`);
        });

        this.handleIncomingMessages(socket, userId);
      }
    });
  }

  private handleIncomingMessages(socket: Socket, userId: string) {
    // Send message to the receiver
    socket.on('sendMessage', async (messageData) => {
      const { senderId, receiverId, content } = messageData;

      const newMessage = new MessageModel({
        senderId,
        receiverId,
        content,
        sentAt: new Date(),
      });
      await newMessage.save();

      const receiverConnection = this.userConnections.get(receiverId);
      if (receiverConnection) {
        receiverConnection.socket.emit('newMessage', newMessage);
      }
    });

    // Fetch all messages between users
    socket.on('getMessages', async (conversationData) => {
      const { senderId, receiverId } = conversationData;

      try {
        const messages = await MessageModel.find({
          $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId },
          ],
        })
          .select('content sentAt')
          .sort({ sentAt: 1 });
        // console.log(messages)
        socket.emit('allMessages', messages);
        

        
      } catch (error) {
        console.error('Error fetching messages:', error);
        socket.emit('error', { message: 'Failed to fetch messages' });
      }
    });
  }

  public start() {
    console.log('Socket.IO server is ready to accept connections.');
  }
}
