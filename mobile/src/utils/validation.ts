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
  return digits.length >= 12 && digits.length <= 19;
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

  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number(value[i]);
  }

  return sum % 10 === Number(value[10]);
}

type BirthDateParts = {
  day: number;
  month: number;
  year: number;
};

function parseBirthDateParts(day: string, month: string, year: string): BirthDateParts | null {
  if (!/^\d{1,2}$/.test(day) || !/^\d{1,2}$/.test(month) || !/^\d{4}$/.test(year)) {
    return null;
  }

  const parsedDay = Number(day);
  const parsedMonth = Number(month);
  const parsedYear = Number(year);

  if (parsedMonth < 1 || parsedMonth > 12 || parsedDay < 1 || parsedDay > 31) {
    return null;
  }

  const date = new Date(Date.UTC(parsedYear, parsedMonth - 1, parsedDay));
  if (
    date.getUTCFullYear() !== parsedYear ||
    date.getUTCMonth() !== parsedMonth - 1 ||
    date.getUTCDate() !== parsedDay
  ) {
    return null;
  }

  return { day: parsedDay, month: parsedMonth, year: parsedYear };
}

export function isValidBirthDate(day: string, month: string, year: string): boolean {
  return parseBirthDateParts(day, month, year) !== null;
}

export function isAtLeastAge(day: string, month: string, year: string, age: number): boolean {
  const parts = parseBirthDateParts(day, month, year);
  if (!parts) {
    return false;
  }

  const today = new Date();
  const cutoffYear = today.getFullYear() - age;

  if (parts.year < cutoffYear) {
    return true;
  }
  if (parts.year > cutoffYear) {
    return false;
  }

  const currentMonth = today.getMonth() + 1;
  if (parts.month < currentMonth) {
    return true;
  }
  if (parts.month > currentMonth) {
    return false;
  }

  return parts.day <= today.getDate();
}

export function formatBirthDate(day: string, month: string, year: string): string | null {
  const parts = parseBirthDateParts(day, month, year);
  if (!parts) {
    return null;
  }

  const paddedDay = String(parts.day).padStart(2, "0");
  const paddedMonth = String(parts.month).padStart(2, "0");
  return `${parts.year}-${paddedMonth}-${paddedDay}`;
}
