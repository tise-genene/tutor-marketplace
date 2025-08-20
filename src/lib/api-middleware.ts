import { NextRequest } from 'next/server';
import { logger } from './logger';

// API request wrapper with logging and error handling
export async function withApiHandler(
  handler: (req: NextRequest) => Promise<Response>,
  req: NextRequest
): Promise<Response> {
  const start = Date.now();
  const method = req.method;
  const path = req.nextUrl.pathname;
  
  try {
    const response = await handler(req);
    const duration = Date.now() - start;
    
    logger.api(method, path, response.status, duration);
    return response;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error(`API Error: ${method} ${path}`, error);
    logger.api(method, path, 500, duration);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: 'Internal server error', code: 'INTERNAL_ERROR' }
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}