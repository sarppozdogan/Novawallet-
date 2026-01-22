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
  if (!/^\d{11}$/.test(value)) {
    return false;
  }
  if (value[0] === "0") {
    return false;
  }

  const digits = value.split("").map((c) => Number(c));
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  let digit10 = (oddSum * 7 - evenSum) % 10;
  if (digit10 < 0) {
    digit10 += 10;
  }
  if (digit10 !== digits[9]) {
    return false;
  }

  const sumFirst10 = digits.slice(0, 10).reduce((acc, val) => acc + val, 0);
  const digit11 = sumFirst10 % 10;
  return digit11 === digits[10];
}
