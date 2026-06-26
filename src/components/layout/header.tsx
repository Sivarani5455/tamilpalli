import { getCurrentUser } from "@/lib/auth";
import type { Locale } from "@/types";

import { HeaderClient } from "./header-client";

export async function Header({ locale }: { locale: Locale }) {
  const user = await getCurrentUser();

  return <HeaderClient locale={locale} isLoggedIn={Boolean(user)} />;
}
