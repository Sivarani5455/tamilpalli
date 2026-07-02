import { getCurrentUser } from "@/lib/auth";
import { getDictionaryEntries } from "@/lib/content";
import type { Locale } from "@/types";

import { HeaderClient } from "./header-client";

export async function Header({ locale }: { locale: Locale }) {
  const [user, dictionaryEntries] = await Promise.all([getCurrentUser(), getDictionaryEntries()]);

  return <HeaderClient locale={locale} isLoggedIn={Boolean(user)} dictionaryEntries={dictionaryEntries} />;
}
