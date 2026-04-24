// Utility for making authenticated API requests with retry logic
const MAX_RETRIES = 3;

type CacheEntry = {
  expiresAt: number;
  data: unknown;
};

const getCache = new Map<string, CacheEntry>();
const inflightGetCache = new Map<string, Promise<unknown>>();

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        throw new Error('Unauthorized');
      }

      // Handle rate limiting with retry
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 1000 * Math.pow(2, attempt);
        
        if (attempt < MAX_RETRIES) {
          console.log(`Rate limited, retrying in ${waitTime}ms (attempt ${attempt}/${MAX_RETRIES})`);
          await sleep(waitTime);
          continue;
        }
        
        // If max retries reached, return the 429 response
        return response;
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Request failed');
      
      // Don't retry for auth errors
      if (lastError.message === 'Unauthorized') {
        throw lastError;
      }
      
      // Retry for network errors
      if (attempt < MAX_RETRIES) {
        const waitTime = 1000 * Math.pow(2, attempt - 1);
        console.log(`Request failed, retrying in ${waitTime}ms (attempt ${attempt}/${MAX_RETRIES})`);
        await sleep(waitTime);
        continue;
      }
    }
  }

  throw lastError || new Error('Request failed after retries');
}

function buildGetCacheKey(endpoint: string, token: string | null) {
  return `${endpoint}::${token || 'anon'}`;
}

function getAuthToken() {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('token');
}

export function invalidateApiCache(endpointPrefix?: string) {
  if (!endpointPrefix) {
    getCache.clear();
    inflightGetCache.clear();
    return;
  }

  for (const key of Array.from(getCache.keys())) {
    if (key.startsWith(`${endpointPrefix}::`) || key.includes(`${endpointPrefix}?`)) {
      getCache.delete(key);
    }
  }

  for (const key of Array.from(inflightGetCache.keys())) {
    if (key.startsWith(`${endpointPrefix}::`) || key.includes(`${endpointPrefix}?`)) {
      inflightGetCache.delete(key);
    }
  }
}

export async function apiGetJsonCached<T>(
  endpoint: string,
  options: RequestInit = {},
  ttlMs = 30_000
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  if (method !== 'GET') {
    throw new Error('apiGetJsonCached only supports GET requests');
  }

  const token = getAuthToken();
  const cacheKey = buildGetCacheKey(endpoint, token);
  const now = Date.now();

  const cached = getCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.data as T;
  }

  const inflight = inflightGetCache.get(cacheKey);
  if (inflight) {
    return inflight as Promise<T>;
  }

  const requestPromise = (async () => {
    const response = await apiRequest(endpoint, { ...options, method: 'GET' });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(body || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    getCache.set(cacheKey, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
    return data as T;
  })();

  inflightGetCache.set(cacheKey, requestPromise);

  try {
    return await requestPromise;
  } finally {
    inflightGetCache.delete(cacheKey);
  }
}