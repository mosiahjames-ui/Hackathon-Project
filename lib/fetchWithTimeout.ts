/**
 * fetch wrapper that aborts if the request takes longer than `timeoutMs`.
 * Throws on timeout or network error so callers can fall back gracefully.
 */
export async function fetchWithTimeout(
  input: string,
  timeoutMs = 3000,
  init?: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
