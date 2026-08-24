/**
 * Utilitar de Rate Limiting în memorie pentru Next.js Route Handlers
 * Folosește o fereastră glisantă (Sliding Window) per IP/identifier
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipRequestMap = new Map<string, RateLimitRecord>();

// Curățare periodică a cheilor expirate la fiecare 5 minute pentru a preveni memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of ipRequestMap.entries()) {
      if (now > record.resetTime) {
        ipRequestMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export function checkRateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 60 * 1000
): { success: boolean; limit: number; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = ipRequestMap.get(identifier);

  if (!record || now > record.resetTime) {
    ipRequestMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetTime: now + windowMs,
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - record.count,
    resetTime: record.resetTime,
  };
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}
