import { kv } from '@vercel/kv';
import { scryptSync, randomBytes, timingSafeEqual, randomUUID } from 'crypto';

export const config = { runtime: 'nodejs18.x' };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  if (username.length < 3 || username.length > 30) {
    return res.status(400).json({ error: 'Username must be 3-30 characters' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  if (action === 'register') {
    const existing = await kv.get(`user:${username}`);
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    const passwordHash = `${salt}:${hash}`;

    await kv.set(`user:${username}`, passwordHash);

    return res.status(201).json({ success: true });
  }

  if (action === 'login') {
    const storedHash = await kv.get(`user:${username}`);
    if (!storedHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const [salt, hash] = storedHash.split(':');
    const newHash = scryptSync(password, salt, 64).toString('hex');

    if (hash.length !== newHash.length || !timingSafeEqual(Buffer.from(hash), Buffer.from(newHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = randomUUID();
    await kv.set(`session:${token}`, JSON.stringify({ username, createdAt: Date.now() }));

    return res.json({ token, username });
  }

  return res.status(400).json({ error: 'Invalid action. Use "register" or "login".' });
}
