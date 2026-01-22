import Constants from "expo-constants";
import { Platform } from "react-native";
import { getToken } from "../storage/authStorage";

const hostUri =
  Constants.expoConfig?.hostUri ||
  // @ts-expect-error: legacy manifest types
  Constants.manifest?.debuggerHost ||
  "";

const inferredHost = hostUri ? hostUri.split(":")[0] : "";
const isIos = Platform.OS === "ios";
const isSimulator = Boolean(Constants.platform?.ios?.simulator) || (isIos && Constants.isDevice === false);

// iOS Simulator'de environment variable'dan IP al, yoksa localhost kullan
// Environment variable script tarafından Mac IP'si ile set edilir
const defaultHost = process.env.EXPO_PUBLIC_API_HOST || (isSimulator ? "localhost" : inferredHost) || "localhost";
const fallbackPort = process.env.EXPO_PUBLIC_API_PORT || "5100";
const DEFAULT_BASE_URL = `http://${defaultHost}:${fallbackPort}`;

const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const allowRemoteOnSimulator = process.env.EXPO_PUBLIC_ALLOW_REMOTE_ON_SIMULATOR === "true";
const isLocalhost =
  typeof envBaseUrl === "string" &&
  (envBaseUrl.includes("localhost") || envBaseUrl.includes("127.0.0.1"));
const useEnvBaseUrl = Boolean(envBaseUrl) && (!isSimulator || allowRemoteOnSimulator || isLocalhost);

export const API_BASE_URL = useEnvBaseUrl && envBaseUrl ? envBaseUrl : DEFAULT_BASE_URL;

// Debug: API Base URL'i console'a yazdır (sadece development'ta)
if (__DEV__) {
  console.log("🔗 API Base URL:", API_BASE_URL);
  console.log("🔗 Environment Variable:", envBaseUrl || "not set");
  console.log("🔗 Default URL:", DEFAULT_BASE_URL);
  if (envBaseUrl && !useEnvBaseUrl) {
    console.log("ℹ️ Simulator'da localhost dışı EXPO_PUBLIC_API_BASE_URL yok sayıldı.");
  }
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
