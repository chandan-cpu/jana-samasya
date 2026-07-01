import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import as from "@/locales/as.json";
import en from "@/locales/en.json";

export const SUPPORTED_LANGUAGES = ["en", "as"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const LANGUAGE_STORAGE_KEY = "user-language";

function resolveDeviceLanguage(): SupportedLanguage {
  const deviceTag = Localization.getLocales()[0]?.languageCode;
  return SUPPORTED_LANGUAGES.includes(deviceTag as SupportedLanguage)
    ? (deviceTag as SupportedLanguage)
    : "en";
}

// Initialize synchronously at module load — resources are bundled in-memory so
// init completes before any component renders, eliminating the blank startup screen.
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    as: { translation: as },
  },
  lng: resolveDeviceLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

// Async: update to the user's saved language preference after startup (non-blocking).
export async function loadSavedLanguage(): Promise<void> {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.includes(saved as SupportedLanguage) && saved !== i18n.language) {
      await i18n.changeLanguage(saved);
    }
  } catch {
    // non-blocking — language will stay as device default
  }
}

export async function changeLanguage(language: SupportedLanguage) {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  await i18n.changeLanguage(language);
}

export default i18n;
