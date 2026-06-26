import { notFound } from "next/navigation";

import { defaultLocale, locales } from "@/lib/constants";
import type { Locale, MessageDictionary } from "@/types";

const dictionaries: Record<Locale, () => Promise<MessageDictionary>> = {
  en: () => import("@/messages/en.json").then((mod) => mod.default),
  ta: () => import("@/messages/ta.json").then((mod) => mod.default),
  fr: () => import("@/messages/fr.json").then((mod) => mod.default),
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getLocaleOrThrow(value: string): Locale {
  if (!isLocale(value)) {
    notFound();
  }

  return value;
}

export async function getMessages(locale: Locale = defaultLocale) {
  return dictionaries[locale]();
}

export function t(messages: MessageDictionary, key: string, fallback?: string) {
  return messages[key] ?? fallback ?? key;
}
