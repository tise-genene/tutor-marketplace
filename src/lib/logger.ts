// Production-ready logger
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta || '');
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta || '');
  },
  api: (method: string, path: string, status: number, duration: number, userId?: string) => {
    console.log(`[API] ${method} ${path} ${status} ${duration}ms ${userId ? `user:${userId}` : 'anonymous'}`);
  }
};