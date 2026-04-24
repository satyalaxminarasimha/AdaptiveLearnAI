"""
Python service bridge - communicates with FastAPI backend.
Handles all API calls to the Python quiz platform service.
"""

const PYTHON_SERVICE_URL = process.env.NEXT_PUBLIC_PYTHON_SERVICE_URL || 'http://localhost:8000';

interface PythonServiceConfig {
  url: string;
  timeout: number;
}

class PythonServiceClient {
  private config: PythonServiceConfig;

  constructor() {
    this.config = {
      url: PYTHON_SERVICE_URL,
      timeout: 300000, // 5 minutes for PDF processing
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.url}${endpoint}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Process a textbook-syllabus pair
   */
  async processTextbook(formData: FormData): Promise<any> {
    return this.request('/process', {
      method: 'POST',
      body: formData,
    });
  }

  /**
   * List all processed textbooks
   */
  async listTextbooks(batch?: string, section?: string): Promise<any> {
    const params = new URLSearchParams();
    if (batch) params.append('batch', batch);
    if (section) params.append('section', section);

    return this.request(`/textbooks?${params.toString()}`, {
      method: 'GET',
    });
  }

  /**
   * Get textbook details
   */
  async getTextbook(textbookId: string): Promise<any> {
    return this.request(`/textbooks/${textbookId}`, {
      method: 'GET',
    });
  }

  /**
   * Search for similar content
   */
  async searchContent(
    query: string,
    textbookId: string,
    k: number = 5,
    unitNumber?: number
  ): Promise<any> {
    const params = new URLSearchParams({
      query,
      textbook_id: textbookId,
      k: k.toString(),
    });
    if (unitNumber) params.append('unit_number', unitNumber.toString());

    return this.request(`/search?${params.toString()}`, {
      method: 'POST',
    });
  }

  /**
   * Get chunks for a textbook
   */
  async getChunks(
    textbookId: string,
    unitNumber?: number,
    skip: number = 0,
    limit: number = 50
  ): Promise<any> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });
    if (unitNumber) params.append('unit_number', unitNumber.toString());

    return this.request(`/chunks/${textbookId}?${params.toString()}`, {
      method: 'GET',
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<any> {
    return this.request('/health', {
      method: 'GET',
    });
  }
}

export const pythonService = new PythonServiceClient();
