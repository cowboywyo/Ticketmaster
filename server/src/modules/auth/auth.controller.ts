import { Request, Response } from 'express';
import * as authService from './auth.service.js';

export async function register(req: Request, res: Response) {
  const { email, password, displayName } = req.body;
  const result = await authService.register(email, password, displayName);
  // No tokens — pending approval
  res.status(201).json({ user: result.user, pendingApproval: true });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ user: result.user, accessToken: result.accessToken });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'No refresh token' } });
    return;
  }
  const result = await authService.refreshToken(token);
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ accessToken: result.accessToken });
}

export async function getMe(req: Request, res: Response) {
  const user = await authService.getMe(req.user!.userId);
  res.json({ user });
}
