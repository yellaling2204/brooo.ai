import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { ENV } from '../config/env';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  jwtToken: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // If in development and local development header or dev fallback is present
    if (ENV.NODE_ENV === 'development' && req.headers['x-dev-user-id']) {
      req.user = {
        id: req.headers['x-dev-user-id'] as string,
        email: 'dev@brooo.ai',
        jwtToken: 'dev-token',
      };
      return next();
    }

    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header' },
    });
  }

  const token = authHeader.split(' ')[1];

  // Dev token support in development mode for easy local Postman testing
  if (ENV.NODE_ENV === 'development' && (token === 'dev-token' || token === 'test-token')) {
    req.user = {
      id: (req.headers['x-dev-user-id'] as string) || '00000000-0000-0000-0000-000000000000',
      email: 'dev@brooo.ai',
      jwtToken: token,
    };
    return next();
  }

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired authentication token' },
      });
    }

    req.user = {
      id: data.user.id,
      email: data.user.email,
      jwtToken: token,
    };

    next();
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'AUTH_ERROR', message: 'Authentication verification failed', details: err.message },
    });
  }
}

