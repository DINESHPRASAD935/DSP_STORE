/**
 * Normalizes API response to array format
 * Handles both paginated (results) and non-paginated responses
 */
export function normalizeArray<T>(data: T[] | { results: T[] } | any): T[] {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === 'object' && Array.isArray(data.results)) {
    return data.results;
  }
  return [];
}

/**
 * Safely extracts array from API response
 */
export function extractArray<T>(data: unknown, fallback: T[] = []): T[] {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
    return data.results;
  }
  return fallback;
}
