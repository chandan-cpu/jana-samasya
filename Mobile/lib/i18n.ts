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

export async function initI18n() {
  const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  const initialLanguage = savedLanguage ?? resolveDeviceLanguage();

  await i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      as: { translation: as },
    },
    lng: initialLanguage,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });
}

export async function changeLanguage(language: SupportedLanguage) {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  await i18n.changeLanguage(language);
}

export default i18n;
