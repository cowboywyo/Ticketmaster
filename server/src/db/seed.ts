import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import db from './connection.js';

async function seed() {
  // Check if root already exists
  const existing = await db('users').where({ system_role: 'root' }).first();
  if (existing) {
    console.log('Root user already exists:', existing.email);
    await db.destroy();
    return;
  }

  // Generate a secure root password
  const rootPassword = crypto.randomBytes(16).toString('base64url'); // 22-char URL-safe password
  const passwordHash = await bcrypt.hash(rootPassword, 10);
  const id = uuid();

  await db('users').insert({
    id,
    email: 'root@ticketmaster.local',
    password_hash: passwordHash,
    display_name: 'Root Admin',
    approved: true,
    system_role: 'root',
  });

  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║           ROOT ACCOUNT CREATED                  ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  Email:    root@ticketmaster.local               ║`);
  console.log(`║  Password: ${rootPassword.padEnd(37)}║`);
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║  SAVE THIS PASSWORD - it cannot be recovered!   ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');

  await db.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
