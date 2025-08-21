'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  type: 'TEXT' | 'FILE' | 'VOICE';
  file_url?: string;
  file_name?: string;
  file_type?: string;
  voice_duration?: number;
  read?: boolean;
}

interface UseSupabaseChatProps {
  userId: string;
  receiverId: string;
  onMessageReceived?: (message: Message) => void;
  onTypingChange?: (userId: string, isTyping: boolean) => void;
  onUserOnline?: (userId: string) => void;
  onUserOffline?: (userId: string) => void;
}

export function useSupabaseChat({
  userId,
  receiverId,
  onMessageReceived,
  onTypingChange,
  onUserOnline,
  onUserOffline,
}: UseSupabaseChatProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Create a unique room ID for the conversation
  const roomId = [userId, receiverId].sort().join('-');

  // Initialize real-time connection
  useEffect(() => {
    const channel = supabase.channel(`chat:${roomId}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    // Handle presence (online/offline status)
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const onlineUserIds = Object.keys(presenceState);
        setOnlineUsers(new Set(onlineUserIds));
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        setOnlineUsers(prev => new Set(prev).add(key));
        onUserOnline?.(key);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
        onUserOffline?.(key);
      });

    // Handle new messages
    channel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${userId} OR receiver_id=eq.${userId}`,
      }, (payload) => {
        const newMessage = payload.new as Message;
        // Only handle messages in this conversation
        if ((newMessage.sender_id === userId && newMessage.receiver_id === receiverId) ||
            (newMessage.sender_id === receiverId && newMessage.receiver_id === userId)) {
          onMessageReceived?.(newMessage);
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${userId} OR receiver_id=eq.${userId}`,
      }, (payload) => {
        const updatedMessage = payload.new as Message;
        // Handle message updates (e.g., read status)
        onMessageReceived?.(updatedMessage);
      });

    // Handle typing indicators
    channel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId !== userId) {
          onTypingChange?.(payload.userId, payload.isTyping);
        }
      });

    // Subscribe to the channel
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        // Track presence
        await channel.track({ userId, online: true });
      } else if (status === 'CLOSED') {
        setIsConnected(false);
      }
    });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [userId, receiverId, roomId, onMessageReceived, onTypingChange, onUserOnline, onUserOffline]);

  // Send message
  const sendMessage = useCallback(async (messageData: Omit<Message, 'id' | 'created_at'>) => {
    if (!isConnected) return null;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }, [isConnected]);

  // Handle typing
  const handleTyping = useCallback((isTyping: boolean) => {
    if (channelRef.current && isConnected) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId, isTyping },
      });
    }
  }, [userId, isConnected]);

  // Start typing indicator
  const startTyping = useCallback(() => {
    handleTyping(true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
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
  const markAsRead = useCallback(async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId)
        .eq('receiver_id', userId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }, [userId]);

  // Load existing messages
  const loadMessages = useCallback(async (limit = 50) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data?.reverse() || [];
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }, [userId, receiverId]);

  return {
    isConnected,
    isTyping,
    onlineUsers,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    loadMessages,
  };
}
