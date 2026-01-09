/**
 * Middleware de autenticación para API de administración
 * Usa API Key simple (puede mejorarse con JWT)
 */

import dotenv from 'dotenv';
dotenv.config();

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'demo-admin-key-change-in-production';

/**
 * Middleware para verificar API Key
 */
export function requireAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '') || req.query.apiKey;
  
  if (!apiKey) {
    return res.status(401).json({
      error: {
        message: 'API Key requerida. Usa el header X-API-Key o ?apiKey=...',
        code: 'MISSING_API_KEY',
      },
    });
  }
  
  if (apiKey !== ADMIN_API_KEY) {
    return res.status(403).json({
      error: {
        message: 'API Key inválida',
        code: 'INVALID_API_KEY',
      },
    });
  }
  
  next();
}

/**
 * Middleware opcional (para endpoints de solo lectura)
 */
export function optionalAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '') || req.query.apiKey;
  
  if (apiKey && apiKey === ADMIN_API_KEY) {
    req.authenticated = true;
  } else {
    req.authenticated = false;
  }
  
  next();
}