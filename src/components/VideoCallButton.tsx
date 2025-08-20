'use client';

import { useState } from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import VideoCall from './VideoCall';

interface VideoCallButtonProps {
  roomId: string;
  userId: string;
  otherUserId: string;
  className?: string;
}

export default function VideoCallButton({ roomId, userId, otherUserId, className = '' }: VideoCallButtonProps) {
  const [isInCall, setIsInCall] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);

  const startCall = () => {
    setShowCallModal(true);
    setIsInCall(true);
  };

  const endCall = () => {
    setIsInCall(false);
    setShowCallModal(false);
  };

  return (
    <>
      <button
        onClick={startCall}
        disabled={isInCall}
        className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          isInCall
            ? 'bg-red-500 text-white cursor-not-allowed'
            : 'bg-green-500 text-white hover:bg-green-600'
        } ${className}`}
      >
        {isInCall ? (
          <>
            <PhoneOff className="w-4 h-4" />
            <span>End Call</span>
          </>
        ) : (
          <>
            <Phone className="w-4 h-4" />
            <span>Start Video Call</span>
          </>
        )}
      </button>

      {showCallModal && (
        <VideoCall
          roomId={roomId}
          userId={userId}
          onEndCall={endCall}
        />
      )}
    </>
  );
}
