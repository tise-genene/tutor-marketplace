'use client';

import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, MessageSquare } from 'lucide-react';
import { wsClient } from '@/lib/websocket';

interface VideoCallProps {
  roomId: string;
  userId: string;
  onEndCall: () => void;
}

export default function VideoCall({ roomId, userId, onEndCall }: VideoCallProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<any>(null);

  useEffect(() => {
    initializeCall();
    return () => {
      endCall();
      wsClient.disconnect();
    };
  }, [roomId]);

  const initializeCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Connect to WebSocket for signaling
      wsClient.connect(roomId, (signalData) => {
        if (peerRef.current) {
          peerRef.current.signal(signalData);
        }
      });

      // Initialize peer connection
      const Peer = (await import('simple-peer')).default;
      peerRef.current = new Peer({
        initiator: true,
        trickle: false,
        stream,
      });

      peerRef.current.on('signal', (data: any) => {
        // Send signal to other peer via WebSocket
        wsClient.sendSignal(data);
      });

      peerRef.current.on('stream', (remoteStream: MediaStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        setIsConnected(true);
        setCallStatus('connected');
      });

      peerRef.current.on('connect', () => {
        console.log('Peer connected');
        setIsConnected(true);
        setCallStatus('connected');
      });

      peerRef.current.on('close', () => {
        console.log('Peer disconnected');
        setIsConnected(false);
        setCallStatus('ended');
      });

    } catch (error) {
      console.error('Error initializing call:', error);
      setCallStatus('ended');
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!isMuted);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!isVideoOff);
      }
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    setIsConnected(false);
    setCallStatus('ended');
    onEndCall();
  };

  const handleIncomingCall = () => {
    setIsIncomingCall(false);
    initializeCall();
  };

  const rejectCall = () => {
    setIsIncomingCall(false);
    onEndCall();
  };

  if (isIncomingCall) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold mb-4">Incoming Call</h3>
          <p className="text-gray-600 mb-6">Someone is calling you...</p>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={handleIncomingCall}
              className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600"
            >
              <Phone className="w-6 h-6" />
            </button>
            <button
              onClick={rejectCall}
              className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col z-50">
      {/* Video containers */}
      <div className="flex-1 relative">
        {/* Remote video (main) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Local video (picture-in-picture) */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>

        {/* Call status overlay */}
        {callStatus === 'connecting' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Connecting...</p>
            </div>
          </div>
        )}

        {callStatus === 'ended' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-center">
              <p className="text-xl mb-4">Call ended</p>
              <button
                onClick={onEndCall}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full ${
              isMuted ? 'bg-red-500 text-white' : 'bg-gray-600 text-white'
            } hover:opacity-80`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${
              isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-600 text-white'
            } hover:opacity-80`}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>

          <button
            onClick={endCall}
            className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          <button className="bg-gray-600 text-white p-3 rounded-full hover:bg-gray-700">
            <MessageSquare className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
