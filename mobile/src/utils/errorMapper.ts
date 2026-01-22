import { ApiError } from "../api/client";

const codeMap: Record<string, string> = {
  ValidationError: "Please check the information and try again.",
  OtpInvalid: "Verification code is invalid or expired.",
  Conflict: "This information is already registered.",
  Unauthorized: "Unable to authenticate with the provided details.",
  NotFound: "We could not find your account.",
  LimitExceeded: "Limit exceeded. Please try a smaller amount.",
  InsufficientBalance: "Insufficient balance.",
  WalletInactive: "Wallet is inactive."
};

export function formatApiError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.message && error.message !== "Request failed.") {
      return error.message;
    }
    if (error.code && codeMap[error.code]) {
      return codeMap[error.code];
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
