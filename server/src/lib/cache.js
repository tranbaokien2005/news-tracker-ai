const store = new Map();

export function setCache(key, value, ttlMs = 5000) {
  const expiresAt = Date.now() + ttlMs;
  store.set(key, { value, expiresAt });
}

export function getCache(key) {
  const entry = store.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function delCache(key) {
  store.delete(key);
}

export default { setCache, getCache, delCache };
