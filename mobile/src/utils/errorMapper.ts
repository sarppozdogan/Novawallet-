import { ApiError } from "../api/client";
import { translate } from "../i18n/i18n";

const codeKeyMap: Record<string, string> = {
  ValidationError: "error.validation",
  OtpInvalid: "error.otp_invalid",
  Conflict: "error.conflict",
  Unauthorized: "error.unauthorized",
  NotFound: "error.not_found",
  LimitExceeded: "error.limit_exceeded",
  InsufficientBalance: "error.insufficient_balance",
  WalletInactive: "error.wallet_inactive"
};

export function formatApiError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.message && error.message !== "Request failed.") {
      return error.message;
    }
    if (error.code && codeKeyMap[error.code]) {
      return translate(codeKeyMap[error.code]);
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
