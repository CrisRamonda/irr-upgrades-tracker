import getRedis from './redis.js';

export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  let redis;
  try {
    redis = getRedis();
    if (!redis) {
      return res.status(500).json({ error: 'Redis connection not configured' });
    }
  } catch {
    return res.status(500).json({ error: 'Redis connection not configured' });
  }

  try {
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
      session = JSON.parse(sessionData);
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
        saveData = JSON.parse(raw);
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
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
