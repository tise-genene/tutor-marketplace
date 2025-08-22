'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
// import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: Date;
  type: 'text' | 'file' | 'voice';
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  voiceDuration?: number;
  read?: boolean;
}

interface UseChatProps {
  userId: string;
  roomId: string;
  onMessageReceived?: (message: Message) => void;
  onTypingChange?: (userId: string, isTyping: boolean) => void;
  onUserOnline?: (userId: string) => void;
  onUserOffline?: (userId: string) => void;
}

export function useChat({
  userId,
  roomId,
  onMessageReceived,
  onTypingChange,
  onUserOnline,
  onUserOffline,
}: UseChatProps) {
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize socket connection
  useEffect(() => {
    // Temporarily disabled for build
    console.log('Socket functionality temporarily disabled');
    setIsConnected(false);
    
    // const newSocket = io({
    //   path: '/api/socket',
    // });

    // newSocket.on('connect', () => {
    //   console.log('Connected to WebSocket');
    //   setIsConnected(true);
      
    //   // Authenticate user
    //   newSocket.emit('authenticate', userId);
      
    //   // Join the chat room
    //   newSocket.emit('join-room', roomId);
      
    //   // Set user as online
    //   newSocket.emit('set-online', userId);
    // });

    // newSocket.on('disconnect', () => {
    //   console.log('Disconnected from WebSocket');
    //   setIsConnected(false);
    // });

    // newSocket.on('receive-message', (message: Message) => {
    //   onMessageReceived?.(message);
    // });

    // newSocket.on('user-typing', ({ userId: typingUserId, isTyping: typing }) => {
    //   if (typingUserId !== userId) {
    //     onTypingChange?.(typingUserId, typing);
    //   }
    // });

    // newSocket.on('user-online', ({ userId: onlineUserId }) => {
    //   setOnlineUsers(prev => new Set(prev).add(onlineUserId));
    //   onUserOnline?.(onlineUserId);
    // });

    // newSocket.on('user-offline', ({ userId: offlineUserId }) => {
    //   setOnlineUsers(prev => {
    //     const newSet = new Set(prev);
    //     newSet.delete(offlineUserId);
    //     return newSet;
    //   });
    //   onUserOffline?.(offlineUserId);
    // });

    // setSocket(newSocket);

    return () => {
      // newSocket.emit('set-offline', userId);
      // newSocket.emit('leave-room', roomId);
      // newSocket.disconnect();
    };
  }, [userId, roomId, onMessageReceived, onTypingChange, onUserOnline, onUserOffline]);

  // Send message
  const sendMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    if (socket && isConnected) {
      const messageData = {
        id: Date.now().toString(), // Temporary ID
        ...message,
        timestamp: new Date(),
      };

      socket.emit('send-message', {
        roomId,
        message: messageData,
        senderId: userId,
        receiverId: message.receiverId,
      });

      return messageData;
    }
    return null;
  }, [socket, isConnected, userId, roomId]);

  // Handle typing
  const handleTyping = useCallback((isTyping: boolean) => {
    if (socket && isConnected) {
      if (isTyping) {
        socket.emit('typing-start', { roomId, userId });
        setIsTyping(true);
      } else {
        socket.emit('typing-stop', { roomId, userId });
        setIsTyping(false);
      }
    }
  }, [socket, isConnected, userId, roomId]);

  // Start typing indicator
  const startTyping = useCallback(() => {
    handleTyping(true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      handleTyping(false);
    }, 3000);
  }, [handleTyping]);

  // Stop typing indicator
  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    handleTyping(false);
  }, [handleTyping]);

  // Mark message as read
  const markAsRead = useCallback((messageId: string) => {
    if (socket && isConnected) {
      socket.emit('mark-read', { roomId, messageId, userId });
    }
  }, [socket, isConnected, userId, roomId]);

  return {
    socket,
    isConnected,
    isTyping,
    onlineUsers,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
  };
}
