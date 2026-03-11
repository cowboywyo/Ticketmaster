import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import db from '../../db/connection.js';
import config from '../../config/index.js';
import { ConflictError, UnauthorizedError, ForbiddenError } from '../../utils/errors.js';
import { AuthPayload } from '../../middleware/auth.js';

function signAccessToken(payload: AuthPayload) {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.accessExpiry as any });
}

function signRefreshToken(payload: AuthPayload) {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.refreshExpiry as any });
}

export async function register(email: string, password: string, displayName: string) {
  const existing = await db('users').where({ email }).first();
  if (existing) throw new ConflictError('Email already registered');

  const id = uuid();
  const passwordHash = await bcrypt.hash(password, 10);
  await db('users').insert({
    id,
    email,
    password_hash: passwordHash,
    display_name: displayName,
    approved: false,
    system_role: 'user',
  });

  // Return user info but NO tokens — they must wait for root approval
  return {
    user: { id, email, displayName, approved: false, systemRole: 'user' },
    pendingApproval: true,
  };
}

export async function login(email: string, password: string) {
  const user = await db('users').where({ email }).first();
  if (!user) throw new UnauthorizedError('Invalid credentials');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new UnauthorizedError('Invalid credentials');

  if (!user.approved) {
    throw new ForbiddenError('Your account is pending approval by an administrator.');
  }

  const payload: AuthPayload = { userId: user.id, email: user.email };
  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      approved: user.approved,
      systemRole: user.system_role,
    },
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

export async function refreshToken(token: string) {
  try {
    const payload = jwt.verify(token, config.jwt.secret) as AuthPayload;
    const user = await db('users').where({ id: payload.userId }).first();
    if (!user) throw new UnauthorizedError('User not found');
    if (!user.approved) throw new ForbiddenError('Account pending approval');

    const newPayload: AuthPayload = { userId: user.id, email: user.email };
    return {
      accessToken: signAccessToken(newPayload),
      refreshToken: signRefreshToken(newPayload),
    };
  } catch (err) {
    if (err instanceof ForbiddenError) throw err;
    throw new UnauthorizedError('Invalid refresh token');
  }
}

export async function getMe(userId: string) {
  const user = await db('users').where({ id: userId }).first();
  if (!user) throw new UnauthorizedError('User not found');
  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
    approved: user.approved,
    systemRole: user.system_role,
    createdAt: user.created_at,
  };
}
