import { Request, Response, NextFunction } from 'express';

interface LimitStore {
  count: number;
  resetTime: number;
}

const store = new Map<string, LimitStore>();

export const rateLimiter = (options: { windowMs: number; max: number; message?: string }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    let userId: string | undefined;
    try {
      if (typeof req.auth === 'function') {
        userId = req.auth()?.userId;
      }
    } catch (e) {
      // clerkMiddleware might not have run yet on public routes, ignore error
    }

    const key = userId || req.ip || 'anonymous';
    const now = Date.now();
    
    let record = store.get(key);
    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + options.windowMs
      };
    }
    
    record.count++;
    store.set(key, record);
    
    res.setHeader('X-RateLimit-Limit', options.max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, options.max - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));
    
    if (record.count > options.max) {
      return res.status(429).json({
        message: options.message || 'Too many requests, please try again later.'
      });
    }
    
    next();
  };
};
