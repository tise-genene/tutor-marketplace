import { NextRequest } from 'next/server';
import { NextApiRequest, NextApiResponse } from 'next';
import { initSocket } from '@/lib/socket';

export async function GET(req: NextRequest) {
  // This is a placeholder for the WebSocket upgrade
  // The actual WebSocket handling is done in the API route
  return new Response('WebSocket endpoint', { status: 200 });
}

// This will be handled by the API route in pages/api/socket.ts
export { default } from '@/pages/api/socket';
