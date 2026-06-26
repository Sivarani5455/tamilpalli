"use client";

import { createContext, useContext } from "react";

import type { Locale, MessageDictionary } from "@/types";

type I18nContextValue = {
  locale: Locale;
  messages: MessageDictionary;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode;
  locale: Locale;
  messages: MessageDictionary;
}) {
  return (
    <I18nContext.Provider value={{ locale, messages }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const value = useContext(I18nContext);

  if (!value) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  return {
    ...value,
    t: (key: string, fallback?: string) => value.messages[key] ?? fallback ?? key,
  };
}
