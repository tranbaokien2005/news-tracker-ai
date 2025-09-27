// client/src/api/http.ts
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5051/api/v1';

function join(base: string, path: string) {
  const b = base.endsWith('/') ? base : base + '/';
  const p = path.startsWith('/') ? path.slice(1) : path;
  return b + p;
}

function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
) {
  const url = new URL(join(API_BASE, path));
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function request<T>(
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
  params?: Record<string, string | number | boolean | undefined>,
  timeoutMs = 15000
): Promise<T> {
  const url = buildUrl(path, params);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`${method} ${url} failed: ${res.status} ${text}`);
    }

    return (await res.json()) as T;
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error(`${method} ${url} timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export function getJSON<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  timeoutMs?: number
): Promise<T> {
  return request<T>('GET', path, undefined, params, timeoutMs);
}

export function postJSON<T>(
  path: string,
  body: unknown,
  timeoutMs?: number
): Promise<T> {
  return request<T>('POST', path, body, undefined, timeoutMs);
}
