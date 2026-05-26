import Redis from 'ioredis';

let redis = null;

export default function getRedis() {
  if (redis) return redis;

  const url = process.env.REDIS_URL || process.env.KV_URL;
  if (!url) return null;

  try {
    redis = new Redis(url, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy() {
        return null;
      },
    });

    redis.on('error', () => {
      redis = null;
    });
  } catch {
    return null;
  }

  return redis;
}
