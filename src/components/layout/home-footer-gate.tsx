"use client";

import { usePathname } from "next/navigation";

import { Footer } from "./footer";

export function HomeFooterGate() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  const isHome = parts.length === 1;
  const isAuthPage = parts[1] === "auth";
  const isDashboardPage = parts[1] === "dashboard";
  const isPricingPage = parts[1] === "pricing";
  const isWordSearchPage = parts[1] === "word-search";

  if (isHome || isAuthPage || isDashboardPage || isPricingPage || isWordSearchPage) {
    return null;
  }

  return <Footer />;
}
