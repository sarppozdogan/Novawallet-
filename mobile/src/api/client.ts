import Constants from "expo-constants";
import { getToken } from "../storage/authStorage";

const hostUri =
  Constants.expoConfig?.hostUri ||
  // @ts-expect-error: legacy manifest types
  Constants.manifest?.debuggerHost ||
  "";

const inferredHost = hostUri ? hostUri.split(":")[0] : "";
const fallbackHost = process.env.EXPO_PUBLIC_API_HOST || inferredHost || "localhost";
const fallbackPort = process.env.EXPO_PUBLIC_API_PORT || "5100";
const DEFAULT_BASE_URL = `http://${fallbackHost}:${fallbackPort}`;

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_BASE_URL;

// Debug: API Base URL'i console'a yazdır (sadece development'ta)
if (__DEV__) {
  console.log("🔗 API Base URL:", API_BASE_URL);
  console.log("🔗 Environment Variable:", process.env.EXPO_PUBLIC_API_BASE_URL || "not set");
  console.log("🔗 Default URL:", DEFAULT_BASE_URL);
}

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
  
  const url = `${API_BASE_URL}${path}`;
  let response: Response;
  
  try {
    response = await fetch(url, {
      ...options,
      headers
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("API Request Error:", {
      url,
      error: errorMessage,
      baseUrl: API_BASE_URL
    });
    throw new ApiError(
      `API sunucusuna ulaşılamadı (${API_BASE_URL}). Lütfen ağ bağlantısını ve API adresini kontrol edin. Hata: ${errorMessage}`
    );
  }

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    const payload = (data || {}) as ApiErrorPayload;
    const errorMessage = payload.message || `Request failed with status ${response.status}`;
    console.error("API Response Error:", {
      url,
      status: response.status,
      statusText: response.statusText,
      payload
    });
    throw new ApiError(errorMessage, payload.errorCode);
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
