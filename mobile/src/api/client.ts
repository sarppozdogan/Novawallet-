import { getToken } from "../storage/authStorage";

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
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options?.headers || {})
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    const payload = (data || {}) as ApiErrorPayload;
    throw new ApiError(payload.message || "Request failed.", payload.errorCode);
  }

  return data as T;
}

export async function apiRequestWithAuth<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getToken();
  const headers = {
    ...(options?.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  return apiRequest<T>(path, { ...options, headers });
}
