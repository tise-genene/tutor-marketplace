'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Send, Paperclip, Mic, MicOff, X, Download, Play, Pause } from 'lucide-react';
import { useChat } from '@/hooks/useChat';

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

interface RealTimeChatProps {
  receiverId: string;
  receiverName: string;
  onClose?: () => void;
  className?: string;
}

export default function RealTimeChat({
  receiverId,
  receiverName,
  onClose,
  className = '',
}: RealTimeChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const roomId = [session?.user?.id, receiverId].sort().join('-');

  const { sendMessage, startTyping, stopTyping, markAsRead, isConnected: socketConnected } = useChat({
    userId: session?.user?.id || '',
    roomId,
    onMessageReceived: (message) => {
      setMessages(prev => [...prev, message]);
      markAsRead(message.id);
    },
    onTypingChange: (userId, typing) => {
      if (userId === receiverId) {
        setIsTyping(typing);
      }
    },
    onUserOnline: (userId) => {
      setOnlineUsers(prev => new Set(prev).add(userId));
    },
    onUserOffline: (userId) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    },
  });

  useEffect(() => {
    setIsConnected(socketConnected);
  }, [socketConnected]);

  // Load existing messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/messages?userId=${receiverId}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.data.messages || []);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    if (session?.user?.id && receiverId) {
      loadMessages();
    }
  }, [session?.user?.id, receiverId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session?.user?.id) return;

    const messageData = {
      content: newMessage,
      senderId: session.user.id,
      receiverId,
      type: 'text' as const,
    };

    const sentMessage = sendMessage(messageData);
    if (sentMessage) {
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      stopTyping();

      // Save to database
      try {
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(messageData),
        });
      } catch (error) {
        console.error('Error saving message:', error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else {
      startTyping();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !session?.user?.id) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (uploadResponse.ok) {
        const { fileUrl } = await uploadResponse.json();

        const messageData = {
          content: `File: ${file.name}`,
          senderId: session.user.id,
          receiverId,
          type: 'file' as const,
          fileUrl,
          fileName: file.name,
          fileType: file.type,
        };

        const sentMessage = sendMessage(messageData);
        if (sentMessage) {
          setMessages(prev => [...prev, sentMessage]);
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('file', audioBlob, 'voice-message.wav');

        try {
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (uploadResponse.ok) {
            const { fileUrl } = await uploadResponse.json();
            const duration = audioChunksRef.current.length * 0.1; // Approximate duration

            const messageData = {
              content: 'Voice message',
              senderId: session?.user?.id || '',
              receiverId,
              type: 'voice' as const,
              fileUrl,
              fileName: 'voice-message.wav',
              fileType: 'audio/wav',
              voiceDuration: duration,
            };

            const sentMessage = sendMessage(messageData);
            if (sentMessage) {
              setMessages(prev => [...prev, sentMessage]);
            }
          }
        } catch (error) {
          console.error('Error uploading voice message:', error);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isReceiverOnline = onlineUsers.has(receiverId);

  return (
    <div className={`bg-white rounded-lg shadow-xl flex flex-col h-96 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {receiverName.charAt(0).toUpperCase()}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
              isReceiverOnline ? 'bg-green-500' : 'bg-gray-400'
            }`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{receiverName}</h3>
            <p className="text-sm text-gray-500">
              {isReceiverOnline ? 'Online' : 'Offline'}
              {isTyping && ' • typing...'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === session?.user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.senderId === session?.user?.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}>
              {message.type === 'text' && (
                <p className="text-sm">{message.content}</p>
              )}
              
              {message.type === 'file' && (
                <div className="flex items-center space-x-2">
                  <Paperclip className="w-4 h-4" />
                  <a
                    href={message.fileUrl}
                    download={message.fileName}
                    className="text-sm underline hover:no-underline"
                  >
                    {message.fileName}
                  </a>
                  <Download className="w-4 h-4" />
                </div>
              )}
              
              {message.type === 'voice' && (
                <div className="flex items-center space-x-2">
                  <Play className="w-4 h-4" />
                  <span className="text-sm">Voice message</span>
                  <span className="text-xs opacity-75">
                    {message.voiceDuration?.toFixed(1)}s
                  </span>
                </div>
              )}
              
              <p className={`text-xs mt-1 ${
                message.senderId === session?.user?.id ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {formatTime(message.timestamp)}
                {message.read && message.senderId === session?.user?.id && (
                  <span className="ml-1">✓</span>
                )}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-gray-50 rounded-b-lg">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2 transition-colors ${
              isRecording 
                ? 'text-red-500 hover:text-red-700' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onBlur={stopTyping}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,application/pdf,.doc,.docx,.txt"
        />
      </div>
    </div>
  );
}
