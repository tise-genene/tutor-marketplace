import { NextApiRequest, NextApiResponse } from 'next';
import { initSocket, SocketWithIO, NextApiResponseWithSocket } from '@/lib/socket';

export default function handler(req: SocketWithIO, res: NextApiResponseWithSocket) {
  if (req.method === 'GET') {
    const io = initSocket(req, res);
    res.end();
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
