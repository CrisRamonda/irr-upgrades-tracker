import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.slice(7);
  const sessionData = await redis.get(`session:${token}`);

  if (!sessionData) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  let session;
  try {
    session = typeof sessionData === 'string' ? JSON.parse(sessionData) : sessionData;
  } catch {
    return res.status(500).json({ error: 'Session data corrupted' });
  }

  const { username } = session;

  if (req.method === 'GET') {
    const raw = await redis.get(`save:${username}`);

    if (!raw) {
      return res.json({
        items: {},
        globalItems: {},
        factionLevels: { igc: 1, vlf: 1, uics: 1, player: 1 },
        builtUpgrades: {}
      });
    }

    let saveData;
    try {
      saveData = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      return res.status(500).json({ error: 'Save data corrupted' });
    }

    return res.json(saveData);
  }

  if (req.method === 'PUT') {
    const { items, globalItems, factionLevels, builtUpgrades } = req.body;

    await redis.set(`save:${username}`, JSON.stringify({
      items: items || {},
      globalItems: globalItems || {},
      factionLevels: factionLevels || { igc: 1, vlf: 1, uics: 1, player: 1 },
      builtUpgrades: builtUpgrades || {}
    }));

    return res.json({ success: true, savedAt: Date.now() });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
