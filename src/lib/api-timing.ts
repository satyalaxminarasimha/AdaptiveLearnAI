type TimingMeta = Record<string, string | number | boolean | null | undefined>;

function shouldLogTiming() {
  return process.env.NODE_ENV !== 'production' || process.env.ENABLE_API_TIMING === 'true';
}

function formatMeta(meta?: TimingMeta) {
  if (!meta) {
    return '';
  }

  const entries = Object.entries(meta).filter(([, value]) => value !== undefined);
  if (entries.length === 0) {
    return '';
  }

  return ` | ${entries.map(([key, value]) => `${key}=${String(value)}`).join(' ')}`;
}

export async function withApiTiming<T>(label: string, fn: () => Promise<T>, meta?: TimingMeta): Promise<T> {
  if (!shouldLogTiming()) {
    return fn();
  }

  const start = Date.now();

  try {
    const result = await fn();
    const durationMs = Date.now() - start;
    console.info(`[api-timing] ${label} ok ${durationMs}ms${formatMeta(meta)}`);
    return result;
  } catch (error) {
    const durationMs = Date.now() - start;
    console.error(`[api-timing] ${label} error ${durationMs}ms${formatMeta(meta)}`, error);
    throw error;
  }
}
