import { HomeSplashScreen } from "@/components/layout/home-splash-screen";
import { getHomeSplashSlides } from "@/lib/content";
import { getLocaleOrThrow } from "@/lib/i18n";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  getLocaleOrThrow(rawLocale);
  const splashSlides = await getHomeSplashSlides();
  return (
    <div className="mx-auto max-w-[120rem] px-4 py-8 sm:px-6 sm:py-10 xl:px-8">
      <HomeSplashScreen slides={splashSlides} />
    </div>
  );
}
