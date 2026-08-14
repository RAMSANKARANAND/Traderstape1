import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getKvNamespace(): Promise<KVNamespace | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    // RATE_LIMIT is bound in wrangler.jsonc but not in TypeScript types yet
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (env as any).RATE_LIMIT as KVNamespace;
  } catch {
    return null;
  }
}

export async function checkRateLimit(
  kv: KVNamespace,
  ip: string,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; retryAfter: number }> {
  const fullKey = `rl:${key}:${ip}`;
  const minTtl = 60;
  const ttl = Math.max(windowSeconds, minTtl);

  try {
    const current = await kv.get(fullKey, { type: "json" }) as { count: number; resetAt: number } | null;
    const now = Date.now();
    const windowMs = windowSeconds * 1000;

    if (!current || now > current.resetAt) {
      // First request or window expired
      await kv.put(fullKey, JSON.stringify({ count: 1, resetAt: now + windowMs }), { expirationTtl: ttl });
      return { allowed: true, retryAfter: windowSeconds };
    }

    if (current.count >= limit) {
      const retryAfter = Math.ceil((current.resetAt - now) / 1000);
      return { allowed: false, retryAfter: Math.max(retryAfter, 1) };
    }

    // Increment count
    await kv.put(fullKey, JSON.stringify({ count: current.count + 1, resetAt: current.resetAt }), { expirationTtl: ttl });
    return { allowed: true, retryAfter: windowSeconds };
  } catch (error) {
    // Fail open - allow request on KV failure
    console.error("Rate limit KV error:", {
      key: fullKey,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    return { allowed: true, retryAfter: windowSeconds };
  }
}