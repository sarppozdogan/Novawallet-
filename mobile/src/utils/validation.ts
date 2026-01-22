const DIGIT_REGEX = /\d/g;

export function sanitizeNumericInput(value: string, maxLength?: number): string {
  const digits = value.replace(/\D/g, "");
  return typeof maxLength === "number" ? digits.slice(0, maxLength) : digits;
}

export function sanitizeAmountInput(value: string): string {
  const normalized = value.replace(/,/g, ".");
  const filtered = normalized.replace(/[^0-9.]/g, "");
  const parts = filtered.split(".");
  const integer = parts[0];
  const fraction = parts.slice(1).join("").slice(0, 2);
  return fraction ? `${integer}.${fraction}` : integer;
}

export function sanitizeIbanInput(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 34);
}

export function isValidIban(value: string): boolean {
  const cleaned = sanitizeIbanInput(value);
  return cleaned.length >= 15 && cleaned.length <= 34;
}

export function sanitizeWalletNumberInput(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}

export function sanitizeCardNumberInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 19);
}

export function isValidCardNumber(value: string): boolean {
  const digits = sanitizeCardNumberInput(value);
  if (digits.length < 12 || digits.length > 19) {
    return false;
  }
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (alternate) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}
export function sanitizePhoneInput(value: string): string {
  const cleaned = value.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) {
    return "+" + cleaned.slice(1).replace(/\+/g, "");
  }
  return cleaned.replace(/\+/g, "");
}

export function countDigits(value: string): number {
  const matches = value.match(DIGIT_REGEX);
  return matches ? matches.length : 0;
}

export function isValidPhone(value: string): boolean {
  const digitCount = countDigits(value);
  return digitCount >= 10 && digitCount <= 15;
}

export function isValidOtp(value: string): boolean {
  return value.length === 6 && /^\d{6}$/.test(value);
}

export function isValidPassword(value: string): boolean {
  return value.trim().length >= 6;
}

export function isValidCurrencyCode(value: string): boolean {
  return /^[A-Z]{3}$/.test(value.trim().toUpperCase());
}

export function isValidTaxNumber(value: string): boolean {
  return /^\d{10}$/.test(value);
}

export function isValidTckn(value: string): boolean {
  return /^\d{11}$/.test(value);
}
