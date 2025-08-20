// Simple WebSocket client for video call signaling
// In a production app, you'd use a proper WebSocket server like Socket.IO

class WebSocketClient {
  private ws: WebSocket | null = null;
  private roomId: string | null = null;
  private onSignalCallback: ((data: any) => void) | null = null;

  connect(roomId: string, onSignal: (data: any) => void) {
    this.roomId = roomId;
    this.onSignalCallback = onSignal;

    // For demo purposes, we'll simulate WebSocket connection
    // In production, connect to your WebSocket server
    console.log(`Connecting to room: ${roomId}`);
    
    // Simulate connection
    setTimeout(() => {
      console.log('WebSocket connected');
    }, 100);
  }

  sendSignal(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        roomId: this.roomId,
        signal: data,
      }));
    } else {
      // For demo, just log the signal
      console.log('Sending signal:', data);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.roomId = null;
    this.onSignalCallback = null;
  }
}

export const wsClient = new WebSocketClient();
