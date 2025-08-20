'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import EnhancedChat from '@/components/EnhancedChat';

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
}

interface User {
  id: string;
  name: string;
  role: 'STUDENT' | 'TUTOR';
}

export default function IndividualMessagePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const otherUserId = params.userId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.user && otherUserId) {
      fetchMessages();
      fetchOtherUser();
    }
  }, [session, otherUserId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?receiverId=${otherUserId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data.data.messages || []);
    } catch (error) {
      setError('Failed to load messages');
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOtherUser = async () => {
    try {
      const response = await fetch(`/api/users/${otherUserId}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      const data = await response.json();
      setOtherUser(data.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleSendMessage = async (content: string, type: 'text' | 'file' | 'voice', file?: File) => {
    if (!session?.user) return;

    try {
      let messageData: any = {
        receiverId: otherUserId,
        content,
        type,
      };

      // Handle file upload
      if (file && type === 'file') {
        try {
          const formData = new FormData();
          formData.append('file', file);

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            throw new Error('Failed to upload file');
          }

          const uploadData = await uploadResponse.json();
          messageData.fileName = uploadData.data.fileName;
          messageData.fileType = uploadData.data.fileType;
          messageData.fileUrl = uploadData.data.url;
        } catch (error) {
          console.error('Error uploading file:', error);
          throw new Error('Failed to upload file');
        }
      }

      // Handle voice message
      if (file && type === 'voice') {
        messageData.fileName = 'voice-message.wav';
        messageData.fileType = 'audio/wav';
        messageData.fileUrl = `https://example.com/voice/${Date.now()}.wav`;
        messageData.voiceDuration = 10; // Mock duration
      }

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const newMessage = await response.json();
      setMessages(prev => [...prev, newMessage.data]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchMessages}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">User not found</p>
          <button
            onClick={() => router.push('/messages')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <button
            onClick={() => router.push('/messages')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {otherUser.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">{otherUser.name}</h1>
              <p className="text-sm text-gray-500">{otherUser.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] p-4">
        <EnhancedChat
          messages={messages}
          onSendMessage={handleSendMessage}
          currentUserId={session?.user?.id || ''}
          otherUserId={otherUserId}
          otherUserName={otherUser.name}
          className="h-full"
        />
      </div>
    </div>
  );
}
