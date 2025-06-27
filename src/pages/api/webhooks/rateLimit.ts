// Lightweight in-memory rate limiter for Vercel/Next.js API routes (no external deps)
// 60 requests per minute per IP

const RATE_LIMIT = 60;
const WINDOW_MS = 60 * 1000;

const ipBuckets: Record<string, { count: number; start: number }> = {};

export function rateLimit(ip: string): boolean {
  const now = Date.now();
  if (!ipBuckets[ip] || now - ipBuckets[ip].start > WINDOW_MS) {
    ipBuckets[ip] = { count: 1, start: now };
    return false;
  }
  ipBuckets[ip].count++;
  if (ipBuckets[ip].count > RATE_LIMIT) {
    return true;
  }
  return false;
}

// Optionally, schedule periodic cleanup for memory leaks in production
setInterval(() => {
  const now = Date.now();
  for (const ip in ipBuckets) {
    if (now - ipBuckets[ip].start > 2 * WINDOW_MS) {
      delete ipBuckets[ip];
    }
  }
}, WINDOW_MS);
