import { Server,WebSocket } from 'ws';
import { Application } from 'express';
import { MessageModel } from '../models/message.model';
import { conversationModel } from '../models/conversation.model';

interface UserConnection {
  userId: string;
  ws: WebSocket;
}

export class WebSocketServer {
  private wss: Server;
  private userConnections: Map<string, UserConnection>;

  constructor(app: Application) {
    this.wss = new Server({ noServer: true });
    this.userConnections = new Map();

    this.wss.on('connection', (ws:WebSocket, req) => {
      const userId = req.url?.split('/')[2]; // Get userId from URL (assuming /ws/:userId)
      if (userId) {
        this.userConnections.set(userId, { userId, ws });
        console.log(`User connected: ${userId}`);

        // Handle disconnection
        ws.on('close', () => {
          this.userConnections.delete(userId);
          console.log(`User disconnected: ${userId}`);
        });
      }

      // Handle incoming messages
      ws.on('message', async (message) => {
        const parsedMessage = JSON.parse(message.toString());

        // Handle sending messages
        if (parsedMessage.type === 'SEND_MESSAGE') {
          const { conversationId, senderId, receiverId, content } = parsedMessage;

          // Save the message to the database
          const newMessage = new MessageModel({
            conversation: conversationId,
            sender: senderId,
            content,
            sentAt: new Date(),
          });
          await newMessage.save();

          // Send message directly to the intended receiver
          const receiverConnection = this.userConnections.get(receiverId);
          if (receiverConnection) {
            receiverConnection.ws.send(JSON.stringify(newMessage)); // Send message only to the receiver
          }
        }

        // Handle fetching messages between users
        if (parsedMessage.type === 'GET_MESSAGES') {
          const { conversationId } = parsedMessage;

          try {
            const messages = await MessageModel.find({ conversation: conversationId })
              .populate('sender') // Assuming you want to include sender info
              .sort({ sentAt: 1 }); // Sort messages by sent date

            // Send the messages back to the requesting user
            ws.send(JSON.stringify({ type: 'MESSAGES', messages }));
          } catch (error) {
            console.error('Error fetching messages:', error);
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Failed to fetch messages' }));
          }
        }
      });
    });
  }

  public start(httpServer: any) {
    httpServer.on('upgrade', (request, socket, head) => {
      this.wss.handleUpgrade(request, socket as any, head, (ws) => {
        this.wss.emit('connection', ws, request);
      });
    });

    console.log(`WebSocket server is ready to accept connections.`);
  }
}
