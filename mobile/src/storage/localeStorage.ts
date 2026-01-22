import * as SecureStore from "expo-secure-store";
import { DEFAULT_LOCALE, Locale, isLocale } from "../i18n/i18n";

const LOCALE_KEY = "novawallet_locale";

export async function loadStoredLocale(): Promise<Locale> {
  try {
    const stored = await SecureStore.getItemAsync(LOCALE_KEY);
    if (stored && isLocale(stored)) {
      return stored;
    }
  } catch {
    // ignore storage errors
  }
  return DEFAULT_LOCALE;
}

export async function saveStoredLocale(locale: Locale): Promise<void> {
  try {
    await SecureStore.setItemAsync(LOCALE_KEY, locale);
  } catch {
    // ignore storage errors
  }
}
