'use client';

import { useState } from 'react';
import { Phone, MessageSquare, FileText, Mic } from 'lucide-react';
import VideoCallButton from '@/components/VideoCallButton';
import EnhancedChat from '@/components/EnhancedChat';

type DemoMessage = {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: Date;
  type: 'text' | 'file' | 'voice';
  fileName?: string;
  fileType?: string;
  fileUrl?: string;
  voiceDuration?: number;
};

export default function DemoPage() {
  const [showChat, setShowChat] = useState(false);
  const [demoMessages, setDemoMessages] = useState<DemoMessage[]>([
    {
      id: '1',
      content: 'Hi! I\'m interested in your math tutoring services.',
      senderId: 'demo-user-2',
      receiverId: 'demo-user-1',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      type: 'text' as const,
    },
    {
      id: '2',
      content: 'Great! I\'d be happy to help you with math. What specific topics do you need help with?',
      senderId: 'demo-user-1',
      receiverId: 'demo-user-2',
      timestamp: new Date(Date.now() - 240000), // 4 minutes ago
      type: 'text' as const,
    },
    {
      id: '3',
      content: '',
      senderId: 'demo-user-2',
      receiverId: 'demo-user-1',
      timestamp: new Date(Date.now() - 180000), // 3 minutes ago
      type: 'file' as const,
      fileName: 'homework.pdf',
      fileType: 'application/pdf',
      fileUrl: 'https://example.com/files/homework.pdf',
    },
    {
      id: '4',
      content: '',
      senderId: 'demo-user-1',
      receiverId: 'demo-user-2',
      timestamp: new Date(Date.now() - 120000), // 2 minutes ago
      type: 'voice' as const,
      fileName: 'voice-message.wav',
      fileType: 'audio/wav',
      fileUrl: 'https://example.com/voice/voice-message.wav',
      voiceDuration: 15,
    },
  ]);

  const handleSendMessage = (content: string, type: 'text' | 'file' | 'voice', file?: File) => {
    const newMessage: DemoMessage = {
      id: Date.now().toString(),
      content,
      senderId: 'demo-user-1',
      receiverId: 'demo-user-2',
      timestamp: new Date(),
      type,
      fileName: file?.name,
      fileType: file?.type,
      fileUrl: file ? `https://example.com/files/${file.name}` : undefined,
      voiceDuration: type === 'voice' ? 10 : undefined,
    };

    setDemoMessages(prev => [...prev, newMessage]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Video Calls & Enhanced Messaging Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the next generation of tutor-student communication with video calls, 
            file sharing, voice messages, and real-time messaging.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Call Demo */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Video Calls</h2>
                <p className="text-gray-600">High-quality peer-to-peer video calls</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Features:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• HD video and audio quality</li>
                  <li>• Mute/unmute microphone</li>
                  <li>• Turn video on/off</li>
                  <li>• Picture-in-picture view</li>
                  <li>• Screen sharing ready</li>
                </ul>
              </div>

              <VideoCallButton
                roomId="demo-room-123"
                userId="demo-user-1"
                otherUserId="demo-user-2"
                className="w-full"
              />
            </div>
          </div>

          {/* Enhanced Messaging Demo */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Enhanced Messaging</h2>
                <p className="text-gray-600">Rich communication with files and voice</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Features:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Text messages with real-time typing</li>
                  <li>• File attachments (images, documents, videos)</li>
                  <li>• Voice messages with recording</li>
                  <li>• Drag & drop file upload</li>
                  <li>• Message status indicators</li>
                </ul>
              </div>

              <button
                onClick={() => setShowChat(!showChat)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showChat ? 'Hide Chat Demo' : 'Show Chat Demo'}
              </button>
            </div>
          </div>
        </div>

        {/* Chat Demo */}
        {showChat && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="h-96">
              <EnhancedChat
                messages={demoMessages}
                onSendMessage={handleSendMessage}
                currentUserId="demo-user-1"
                otherUserId="demo-user-2"
                otherUserName="Sarah Johnson (Math Tutor)"
                className="h-full"
              />
            </div>
          </div>
        )}

        {/* Feature Comparison */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Feature Comparison
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Calls</h3>
              <p className="text-gray-600 text-sm">
                Face-to-face tutoring sessions with crystal clear video and audio quality
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">File Sharing</h3>
              <p className="text-gray-600 text-sm">
                Share homework, study materials, and resources instantly
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Voice Messages</h3>
              <p className="text-gray-600 text-sm">
                Quick voice explanations and clarifications
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
