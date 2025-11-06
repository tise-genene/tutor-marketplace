import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { supabase } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { apiSuccess, ApiErrors } from '@/lib/api-response';

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return ApiErrors.UNAUTHORIZED();
    }

    // Get user from Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', session.user.id)
      .single();

    if (userError || !user) {
      return ApiErrors.NOT_FOUND('User');
    }

    // Get all unique conversations using a more efficient query
    // First, get all message pairs
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('sender_id, receiver_id, content, created_at, read, id')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return ApiErrors.INTERNAL_ERROR();
    }

    // Group by conversation partner
    const conversationMap = new Map<string, any>();
    
    (messages || []).forEach((message: any) => {
      const otherUserId = message.sender_id === user.id 
        ? message.receiver_id 
        : message.sender_id;
      
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          lastMessage: null,
          unreadCount: 0,
        });
      }
      
      const conv = conversationMap.get(otherUserId);
      
      // Set last message if not set or this is newer
      if (!conv.lastMessage || new Date(message.created_at) > new Date(conv.lastMessage.createdAt)) {
        conv.lastMessage = {
          content: message.content,
          createdAt: message.created_at,
          read: message.read,
        };
      }
      
      // Count unread messages
      if (message.sender_id === otherUserId && message.receiver_id === user.id && !message.read) {
        conv.unreadCount++;
      }
    });

    // Get user details for each conversation partner
    const userIds = Array.from(conversationMap.keys());
    if (userIds.length === 0) {
      return NextResponse.json({ conversations: [] });
    }

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, role')
      .in('id', userIds);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return ApiErrors.INTERNAL_ERROR();
    }

    // Combine conversation data with user info
    const conversations = (users || []).map((u: any) => {
      const conv = conversationMap.get(u.id);
      return {
        id: u.id,
        name: u.name,
        role: u.role,
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount,
      };
    }).sort((a: any, b: any) => {
      // Sort by last message time
      const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    return apiSuccess({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return ApiErrors.INTERNAL_ERROR();
  }
}