import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { JWTPayload } from '../types/index.js';

// Gerar token JWT
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

// Verificar token JWT
export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, config.jwtSecret) as JWTPayload;
}

// Decodificar token (sem verificar)
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}