import { ApiError, apiRequest } from "./client";

const DEMO_USER_ID = 1001;
const DEMO_WALLET_ID = 7001;
const DEMO_WALLET_NUMBER = "NW-000001";
const DEMO_CURRENCY_CODE = "TRY";
const DEMO_TOKEN = "demo-token";

function shouldUseAuthFallback(error: unknown): boolean {
  return error instanceof ApiError && error.code === "NetworkError";
}

function logAuthFallback(label: string) {
  if (__DEV__) {
    console.warn(`[demo] ${label} fallback used (API unreachable).`);
  }
}

export type RegisterStartResult = {
  userId: number;
  status: number;
};

export type LoginResult = {
  isSuccess: boolean;
  requiresProfileCompletion: boolean;
  token?: string | null;
  userId?: number | null;
};

export type CompleteProfileResult = {
  userId: number;
  walletId: number;
  walletNumber: string;
  currencyCode: string;
};

export async function registerStart(phone: string): Promise<RegisterStartResult> {
  try {
    return await apiRequest<RegisterStartResult>("/api/auth/register/start", {
      method: "POST",
      body: JSON.stringify({ phone })
    });
  } catch (error) {
    if (shouldUseAuthFallback(error)) {
      logAuthFallback("registerStart");
      return { userId: DEMO_USER_ID, status: 1 };
    }
    throw error;
  }
}

export async function verifyOtp(phone: string, code: string): Promise<void> {
  try {
    await apiRequest<void>("/api/auth/register/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, code })
    });
  } catch (error) {
    if (shouldUseAuthFallback(error)) {
      logAuthFallback("verifyOtp");
      return;
    }
    throw error;
  }
}

export async function completeProfile(payload: {
  phone: string;
  userType: number;
  password: string;
  name?: string | null;
  surname?: string | null;
  address?: string | null;
  tckn?: string | null;
  taxNumber?: string | null;
  currencyCode?: string | null;
}): Promise<CompleteProfileResult> {
  try {
    return await apiRequest<CompleteProfileResult>("/api/auth/register/complete", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  } catch (error) {
    if (shouldUseAuthFallback(error)) {
      logAuthFallback("completeProfile");
      return {
        userId: DEMO_USER_ID,
        walletId: DEMO_WALLET_ID,
        walletNumber: DEMO_WALLET_NUMBER,
        currencyCode: payload.currencyCode?.trim().toUpperCase() || DEMO_CURRENCY_CODE
      };
    }
    throw error;
  }
}

export async function login(phone: string, password: string): Promise<LoginResult> {
  try {
    return await apiRequest<LoginResult>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ phone, password })
    });
  } catch (error) {
    if (shouldUseAuthFallback(error)) {
      logAuthFallback("login");
      return {
        isSuccess: true,
        requiresProfileCompletion: false,
        token: DEMO_TOKEN,
        userId: DEMO_USER_ID
      };
    }
    throw error;
  }
}
