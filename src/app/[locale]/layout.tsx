import { Header } from "@/components/layout/header";
import { HomeFooterGate } from "@/components/layout/home-footer-gate";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { getLocaleOrThrow, getMessages } from "@/lib/i18n";

export function generateStaticParams() {
  return [
    { locale: "en" },
    { locale: "ta" },
    { locale: "fr" },
  ];
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  const messages = await getMessages(locale);

  return (
    <I18nProvider locale={locale} messages={messages}>
      <div className={`min-h-screen bg-transparent text-[var(--brand-ink)] ${locale === "ta" ? "locale-ta" : ""}`}>
        <Header locale={locale} />
        <main>{children}</main>
        <HomeFooterGate />
      </div>
    </I18nProvider>
  );
}
