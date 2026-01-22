import { apiRequest } from "./client";

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
  return apiRequest<RegisterStartResult>("/api/auth/register/start", {
    method: "POST",
    body: JSON.stringify({ phone })
  });
}

export async function verifyOtp(phone: string, code: string): Promise<void> {
  await apiRequest<void>("/api/auth/register/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone, code })
  });
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
  return apiRequest<CompleteProfileResult>("/api/auth/register/complete", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function login(phone: string, password: string): Promise<LoginResult> {
  return apiRequest<LoginResult>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ phone, password })
  });
}
