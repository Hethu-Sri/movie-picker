const cacheStore = new Map();
const pendingStore = new Map();

export function getCachedValue(key) {
  const cached = cacheStore.get(key);

  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    cacheStore.delete(key);
    return null;
  }

  return cached.value;
}

export function setCachedValue(key, value, ttlMs) {
  cacheStore.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });

  return value;
}

export async function getOrSetCache(key, ttlMs, loader) {
  const cached = getCachedValue(key);

  if (cached !== null) {
    return cached;
  }

  if (pendingStore.has(key)) {
    return pendingStore.get(key);
  }

  const pending = (async () => {
    try {
      const value = await loader();
      setCachedValue(key, value, ttlMs);
      return value;
    } finally {
      pendingStore.delete(key);
    }
  })();

  pendingStore.set(key, pending);
  return pending;
}

