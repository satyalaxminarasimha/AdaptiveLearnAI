// Utility for making authenticated API requests with retry logic
const MAX_RETRIES = 3;

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