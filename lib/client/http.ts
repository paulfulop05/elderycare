export type ApiEnvelope<T> =
  | { data: T }
  | { error: string; details?: Record<string, string> };

export const isApiError = <T>(
  value: ApiEnvelope<T>,
): value is { error: string; details?: Record<string, string> } =>
  "error" in value;

export const fetchJson = async <T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> => {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return (await response.json()) as T;
};

export const isNetworkFailure = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  const lower = error.message.toLowerCase();
  return (
    lower.includes("failed to fetch") ||
    lower.includes("network") ||
    lower.includes("http 502") ||
    lower.includes("http 503") ||
    lower.includes("http 504")
  );
};
