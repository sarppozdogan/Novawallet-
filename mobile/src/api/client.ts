const DEFAULT_BASE_URL = "http://localhost:5000";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_BASE_URL;

type ApiErrorPayload = {
  errorCode?: string;
  message?: string;
};

export class ApiError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

async function parseJsonSafely(response: Response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options?.headers || {})
    },
    ...options
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    const payload = (data || {}) as ApiErrorPayload;
    throw new ApiError(payload.message || "Request failed.", payload.errorCode);
  }

  return data as T;
}
