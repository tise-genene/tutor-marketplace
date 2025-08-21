'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSupabaseChat } from '@/hooks/useSupabaseChat';
import { useSession } from 'next-auth/react';
import { PaperAirplaneIcon, PaperClipIcon, MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline';
import { CheckIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

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

interface RealTimeChatProps {
  receiverId: string;
  receiverName: string;
  className?: string;
}

export default function RealTimeChat({ receiverId, receiverName, className = '' }: RealTimeChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const {
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    loadMessages,
  } = useSupabaseChat({
    userId: session?.user?.id || '',
    receiverId,
    onMessageReceived: (message) => {
      setMessages(prev => [...prev, message]);
      if (message.sender_id === receiverId) {
        markAsRead(message.id);
      }
    },
    onTypingChange: (userId, isTyping) => {
      if (userId === receiverId) {
        setIsTyping(isTyping);
      }
    },
    onUserOnline: (userId) => {
      if (userId === receiverId) {
        setIsOnline(true);
      }
    },
    onUserOffline: (userId) => {
      if (userId === receiverId) {
        setIsOnline(false);
      }
    },
  });

  // Load existing messages
  useEffect(() => {
    if (session?.user?.id && receiverId) {
      loadMessages(50).then((existingMessages) => {
        setMessages(existingMessages);
        setIsLoading(false);
      });
    }
  }, [session?.user?.id, receiverId, loadMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when they come into view
  useEffect(() => {
    const unreadMessages = messages.filter(
      msg => msg.sender_id === receiverId && !msg.read
    );
    unreadMessages.forEach(msg => markAsRead(msg.id));
  }, [messages, receiverId, markAsRead]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !isConnected) return;

    const messageData = {
      content: newMessage.trim(),
      sender_id: session?.user?.id || '',
      receiver_id: receiverId,
      type: 'TEXT' as const,
    };

    const sentMessage = await sendMessage(messageData);
    if (sentMessage) {
      setNewMessage('');
      stopTyping();
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
    if (!file || !isConnected) return;

    try {
      // Upload file to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          fileType: file.type,
          bucket: 'documents',
        }),
      }).then(res => res.json());

      if (error) throw new Error(error);

      // Send message with file
      const messageData = {
        content: `File: ${file.name}`,
        sender_id: session?.user?.id || '',
        receiver_id: receiverId,
        type: 'FILE' as const,
        file_name: file.name,
        file_type: file.type,
        file_url: data.url,
      };

      await sendMessage(messageData);
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const fileName = `voice-${Date.now()}.wav`;
        
        try {
          // Upload audio to Supabase Storage
          const { data, error } = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName,
              fileType: 'audio/wav',
              bucket: 'voice-messages',
              audioBlob: await blobToBase64(audioBlob),
            }),
          }).then(res => res.json());

          if (error) throw new Error(error);

          // Send voice message
          const messageData = {
            content: 'Voice message',
            sender_id: session?.user?.id || '',
            receiver_id: receiverId,
            type: 'VOICE' as const,
            file_name: fileName,
            file_type: 'audio/wav',
            file_url: data.url,
            voice_duration: audioChunks.length * 0.1, // Approximate duration
          };

          await sendMessage(messageData);
        } catch (error) {
          console.error('Voice upload error:', error);
          alert('Failed to send voice message');
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = audioChunks;
      setIsRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
      alert('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isOwnMessage = (message: Message) => message.sender_id === session?.user?.id;

  if (isLoading) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
            <div>
              <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-16 animate-pulse mt-1"></div>
            </div>
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse mt-1"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {receiverName.charAt(0).toUpperCase()}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
              isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{receiverName}</h3>
            <p className="text-sm text-gray-500">
              {isOnline ? 'Online' : 'Offline'}
              {isTyping && ' • typing...'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-500">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md ${
              isOwnMessage(message) 
                ? 'bg-blue-500 text-white rounded-l-lg rounded-tr-lg' 
                : 'bg-gray-100 text-gray-900 rounded-r-lg rounded-tl-lg'
            } p-3`}>
              {message.type === 'TEXT' && (
                <p className="text-sm">{message.content}</p>
              )}
              
              {message.type === 'FILE' && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{message.content}</p>
                  <a
                    href={message.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-xs underline hover:no-underline"
                  >
                    <PaperClipIcon className="w-4 h-4" />
                    <span>{message.file_name}</span>
                  </a>
                </div>
              )}
              
              {message.type === 'VOICE' && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{message.content}</p>
                  <audio controls className="w-full">
                    <source src={message.file_url} type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                  {message.voice_duration && (
                    <p className="text-xs opacity-75">
                      Duration: {Math.round(message.voice_duration)}s
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs opacity-75">
                  {formatTime(message.created_at)}
                </span>
                {isOwnMessage(message) && (
                  <div className="flex items-center space-x-1">
                    {message.read ? (
                      <CheckCircleIcon className="w-4 h-4 text-blue-300" />
                    ) : (
                      <CheckIcon className="w-4 h-4 text-blue-300" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <PaperClipIcon className="w-5 h-5" />
          </button>
          
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2 transition-colors ${
              isRecording 
                ? 'text-red-500 hover:text-red-700' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {isRecording ? (
              <StopIcon className="w-5 h-5" />
            ) : (
              <MicrophoneIcon className="w-5 h-5" />
            )}
          </button>
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onBlur={stopTyping}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!isConnected}
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
      </div>
    </div>
  );
}
