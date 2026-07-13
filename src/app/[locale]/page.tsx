import Link from "next/link";

import { getLocaleOrThrow } from "@/lib/i18n";

const copy = {
  en: {
    title: "தமிழைக் கற்று மகிழுங்கள்",
    description: "Choose an activity and start learning immediately.",
  },
  fr: {
    title: "தமிழைக் கற்று மகிழுங்கள்",
    description: "Choisissez une activité et commencez directement.",
  },
  ta: {
    title: "தமிழைக் கற்று மகிழுங்கள்",
    description: "ஒரு பயிற்சியைத் தேர்ந்தெடுத்து உடனே கற்கத் தொடங்குங்கள்.",
  },
} as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  const labels = copy[locale];

  return (
    <main className="min-h-[calc(100dvh-72px)] bg-[#fff7ec] px-4 py-10 sm:min-h-[calc(100dvh-88px)] sm:px-6 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[1.75rem] border-[3px] border-[#180d2b] bg-white p-6 shadow-[7px_8px_0_#180d2b] sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7c3aed]">Kalvikoodam</p>
          <h1 className="mt-4 font-tamil text-3xl font-black leading-tight text-[#180d2b] sm:text-5xl">{labels.title}</h1>
          <p className="mt-4 max-w-2xl font-semibold leading-7 text-[#6f587f]">{labels.description}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link href={`/${locale}/kural-vettai`} className="rounded-[1.15rem] border-[3px] border-[#180d2b] bg-[#ffc43d] p-5 font-black text-[#180d2b] shadow-[4px_5px_0_#180d2b] transition hover:-translate-y-0.5">Kural Vettai →</Link>
            <Link href={`/${locale}/thirukkural`} className="rounded-[1.15rem] border-[3px] border-[#180d2b] bg-[#eee5ff] p-5 font-black text-[#180d2b] shadow-[4px_5px_0_#180d2b] transition hover:-translate-y-0.5">Thirukkural →</Link>
            <Link href={`/${locale}/kathaigal`} className="rounded-[1.15rem] border-[3px] border-[#180d2b] bg-[#ddf8e9] p-5 font-black text-[#180d2b] shadow-[4px_5px_0_#180d2b] transition hover:-translate-y-0.5">Kathaigal →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
