'use client';

const cache = new Map();
const DEFAULT_TTL = 15_000;

export function getClientJson(url, options = {}) {
  const { ttl = DEFAULT_TTL, ...fetchOptions } = options;
  const now = Date.now();
  const cached = cache.get(url);

  if (cached && cached.expiresAt > now) return cached.promise;

  const promise = fetch(url, { cache: 'no-store', ...fetchOptions }).then(async (response) => {
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `Request failed with status ${response.status}`);
    return data;
  });
  const entry = { expiresAt: now + ttl, promise };
  cache.set(url, entry);
  promise.catch(() => {
    if (cache.get(url) === entry) cache.delete(url);
  });
  return promise;
}
