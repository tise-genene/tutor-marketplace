import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';

export interface SocketServer extends NetServer {
  io?: SocketIOServer;
}

// Temporarily disabled due to type conflicts
// export interface SocketWithIO extends NextApiRequest {
//   socket: {
//     server: SocketServer;
//   };
// }

// export interface NextApiResponseWithSocket extends NextApiResponse {
//   socket: {
//     server: SocketServer;
//   };
// }

// Temporarily disabled due to type conflicts
// export const initSocket = (req: SocketWithIO, res: NextApiResponseWithSocket) => {
//   if (!res.socket.server.io) {
//     const io = new SocketIOServer(res.socket.server, {
//       path: '/api/socket',
//       addTrailingSlash: false,
//     });

//     // Store connected users
//     const connectedUsers = new Map<string, string>();

//     io.on('connection', (socket) => {
//       console.log('User connected:', socket.id);

//       // Handle user authentication
//       socket.on('authenticate', (userId: string) => {
//         connectedUsers.set(userId, socket.id);
//         socket.data.userId = userId;
//         console.log('User authenticated:', userId);
//       });

//       // Handle joining a chat room
//       socket.on('join-room', (roomId: string) => {
//         socket.join(roomId);
//         console.log(`User ${socket.data.userId} joined room: ${roomId}`);
//       });

//       // Handle leaving a chat room
//       socket.on('leave-room', (roomId: string) => {
//         socket.leave(roomId);
//         console.log(`User ${socket.data.userId} left room: ${roomId}`);
//       });

//       // Handle sending messages
//       socket.on('send-message', async (data) => {
//         const { roomId, message, senderId, receiverId } = data;
        
//         // Broadcast message to room
//         socket.to(roomId).emit('receive-message', {
//           ...message,
//           senderId,
//           receiverId,
//           timestamp: new Date(),
//         });

//         // Send confirmation back to sender
//         socket.emit('message-sent', {
//           messageId: message.id,
//           timestamp: new Date(),
//         });

//         console.log(`Message sent in room ${roomId}:`, message.content);
//       });

//       // Handle typing indicators
//       socket.on('typing-start', (data) => {
//         const { roomId, userId } = data;
//         socket.to(roomId).emit('user-typing', { userId, isTyping: true });
//       });

//       socket.on('typing-stop', (data) => {
//         const { roomId, userId } = data;
//         socket.to(roomId).emit('user-typing', { userId, isTyping: false });
//       });

//       // Handle read receipts
//       socket.on('mark-read', (data) => {
//         const { roomId, messageId, userId } = data;
//         socket.to(roomId).emit('message-read', { messageId, userId });
//       });

//       // Handle online status
//       socket.on('set-online', (userId: string) => {
//         connectedUsers.set(userId, socket.id);
//         socket.broadcast.emit('user-online', { userId });
//       });

//       socket.on('set-offline', (userId: string) => {
//         connectedUsers.delete(userId);
//         socket.broadcast.emit('user-offline', { userId });
//       });

//       // Handle disconnection
//       socket.on('disconnect', () => {
//         if (socket.data.userId) {
//           connectedUsers.delete(socket.data.userId);
//           socket.broadcast.emit('user-offline', { userId: socket.data.userId });
//         }
//         console.log('User disconnected:', socket.id);
//       });
//     });

//     res.socket.server.io = io;
//   }

//   return res.socket.server.io;
// };
