import { sanitizeNumericInput } from "./validation";

export type CountryOption = {
  code: string;
  dial: string;
  nameKey: string;
};

export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: "TR", dial: "+90", nameKey: "country.tr" },
  { code: "US", dial: "+1", nameKey: "country.us" },
  { code: "GB", dial: "+44", nameKey: "country.gb" },
  { code: "DE", dial: "+49", nameKey: "country.de" },
  { code: "FR", dial: "+33", nameKey: "country.fr" },
  { code: "NL", dial: "+31", nameKey: "country.nl" },
  { code: "ES", dial: "+34", nameKey: "country.es" },
  { code: "IT", dial: "+39", nameKey: "country.it" },
  { code: "AE", dial: "+971", nameKey: "country.ae" },
  { code: "SA", dial: "+966", nameKey: "country.sa" },
  { code: "QA", dial: "+974", nameKey: "country.qa" },
  { code: "RU", dial: "+7", nameKey: "country.ru" },
  { code: "IN", dial: "+91", nameKey: "country.in" }
];

export const DEFAULT_COUNTRY_CODE = "TR";

export function getCountryByCode(code: string): CountryOption {
  const normalized = code.toUpperCase();
  return COUNTRY_OPTIONS.find((item) => item.code === normalized) || COUNTRY_OPTIONS[0];
}

export function parsePhoneNumber(phone: string): { country: CountryOption; local: string } {
  const digits = phone.replace(/\D/g, "");
  if (!digits) {
    return { country: getCountryByCode(DEFAULT_COUNTRY_CODE), local: "" };
  }

  const sorted = [...COUNTRY_OPTIONS].sort((a, b) => {
    const aDigits = a.dial.replace(/\D/g, "").length;
    const bDigits = b.dial.replace(/\D/g, "").length;
    return bDigits - aDigits;
  });

  for (const option of sorted) {
    const dialDigits = option.dial.replace(/\D/g, "");
    if (digits.startsWith(dialDigits)) {
      return { country: option, local: digits.slice(dialDigits.length) };
    }
  }

  return { country: getCountryByCode(DEFAULT_COUNTRY_CODE), local: digits };
}

export function buildPhoneNumber(country: CountryOption, local: string): string {
  return `${country.dial}${local}`;
}

export function getMaxLocalLength(country: CountryOption, maxTotal = 15): number {
  const dialDigits = country.dial.replace(/\D/g, "").length;
  return Math.max(1, maxTotal - dialDigits);
}

export function sanitizeLocalPhoneInput(value: string, country: CountryOption, maxTotal = 15): string {
  const dialDigits = country.dial.replace(/\D/g, "");
  const maxLocalLength = getMaxLocalLength(country, maxTotal);
  const sanitized = sanitizeNumericInput(value, maxLocalLength + dialDigits.length);
  const withoutDial = sanitized.startsWith(dialDigits) ? sanitized.slice(dialDigits.length) : sanitized;
  return withoutDial.slice(0, maxLocalLength);
}
