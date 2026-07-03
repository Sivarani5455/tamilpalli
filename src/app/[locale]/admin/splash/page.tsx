import { existsSync } from "node:fs";
import path from "node:path";

import {
  deleteHomeSplashSlideAction,
  moveHomeSplashSlideAction,
} from "@/app/[locale]/admin/content-actions";
import { SplashSlideForm } from "@/components/admin/splash-form";
import { requireAdminUser } from "@/lib/auth";
import { getAdminHomeSplashSlides } from "@/lib/content-admin";
import { getLocaleOrThrow } from "@/lib/i18n";
import Link from "next/link";

function SplashBadge() {
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-[#180d2b] bg-[#f59e0b] text-white shadow-[3px_4px_0_#180d2b]">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      >
        <path d="M12 3v18" />
        <path d="M5 7h14" />
        <path d="M7 7c0 4 2 6 5 6s5-2 5-6" />
        <path d="M8 17h8" />
      </svg>
    </span>
  );
}

function getSlideAssetStatus(imageUrl: string) {
  const isRemote = /^https?:\/\//i.test(imageUrl);

  if (isRemote) {
    return {
      label: "URL distante",
      tone: "border-[#22d3ee] bg-[#e0fbff] text-[#0e7490]",
      hint: imageUrl,
    };
  }

  if (!imageUrl.startsWith("/")) {
    return {
      label: "Chemin invalide",
      tone: "border-[#ff3b6f] bg-[#ffe4ee] text-[#be123c]",
      hint: "Utilise /nom-image.png ou une URL https://...",
    };
  }

  const localPath = path.join(process.cwd(), "public", imageUrl.replace(/^\/+/, ""));
  const exists = existsSync(localPath);

  return exists
    ? {
        label: "Image trouvée",
        tone: "border-[#14b86a] bg-[#dcfce7] text-[#047857]",
        hint: localPath,
      }
    : {
        label: "Image introuvable",
        tone: "border-[#ff3b6f] bg-[#ffe4ee] text-[#be123c]",
        hint: localPath,
      };
}

export default async function AdminSplashPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireAdminUser(locale);

  const slides = await getAdminHomeSplashSlides();

  return (
    <div className="mx-auto max-w-6xl px-2 py-6 sm:px-4">
      <div className="relative overflow-hidden rounded-[1.75rem] border-[3px] border-[#180d2b] bg-[#1b0d2f] p-6 text-white shadow-[8px_9px_0_#ffc43d] sm:p-8">
        <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[#7c3aed]/45" />
        <p className="relative text-xs font-black uppercase tracking-[0.24em] text-[#ffc43d]">Splash admin</p>
        <h1 className="relative mt-2 font-display text-[clamp(2rem,5vw,3.2rem)] font-black leading-tight">
          Gestion des images splash
        </h1>
        <p className="relative mt-3 max-w-3xl text-sm font-semibold leading-7 text-[#efe6ff]">
          Ajoute et ordonne les écrans splash. Le type intro garde la mise en page encadrée, le type plein écran
          affiche l&apos;image sur toute la page.
        </p>
        <div className="relative mt-5 flex flex-wrap gap-3">
          <Link
            href={`/${locale}`}
            className="rounded-full border-[3px] border-[#180d2b] bg-[#c6ff2e] px-5 py-3 text-sm font-black text-[#180d2b] shadow-[4px_5px_0_#180d2b] transition hover:-translate-y-0.5"
          >
            Tester le splash
          </Link>
          <span className="rounded-full border-[3px] border-[#ffc43d] bg-white/10 px-4 py-3 text-sm font-black text-white">
            {slides.length} slides
          </span>
        </div>
      </div>

      <div className="mt-8">
        <SplashSlideForm locale={locale} />
      </div>

      <div className="mt-8 grid gap-6">
        {slides.map((slide) => {
          const assetStatus = getSlideAssetStatus(slide.imageUrl);

          return (
            <section
              key={slide.id}
              className="rounded-[1.5rem] border-[3px] border-[#180d2b] bg-white p-5 shadow-[6px_7px_0_#180d2b]"
            >
              <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div className="flex min-w-0 items-center gap-4">
                  <SplashBadge />
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-2xl font-black leading-tight text-[#180d2b]">
                      {slide.kind === "fullscreen" ? "Image plein écran" : "Intro encadrée"}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border-[2px] border-[#180d2b] bg-[#efe6ff] px-3 py-1 text-xs font-black uppercase text-[#7c3aed]">
                        ordre {slide.sortOrder}
                      </span>
                      <span
                        className={`rounded-full border-[2px] px-3 py-1 text-xs font-black uppercase ${
                          slide.isActive
                            ? "border-[#14b86a] bg-[#dcfce7] text-[#047857]"
                            : "border-[#8a6a9c] bg-[#f6f0ff] text-[#6b5a78]"
                        }`}
                      >
                        {slide.isActive ? "actif" : "inactif"}
                      </span>
                      <span className={`rounded-full border-[2px] px-3 py-1 text-xs font-black uppercase ${assetStatus.tone}`}>
                        {assetStatus.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <form action={moveHomeSplashSlideAction}>
                    <input type="hidden" name="id" value={slide.id} />
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-[#180d2b] bg-white text-[#180d2b] shadow-[3px_4px_0_#180d2b] transition hover:-translate-y-0.5"
                      aria-label="Monter"
                    >
                      ↑
                    </button>
                  </form>

                  <form action={moveHomeSplashSlideAction}>
                    <input type="hidden" name="id" value={slide.id} />
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-[#180d2b] bg-white text-[#180d2b] shadow-[3px_4px_0_#180d2b] transition hover:-translate-y-0.5"
                      aria-label="Descendre"
                    >
                      ↓
                    </button>
                  </form>

                  <form action={deleteHomeSplashSlideAction}>
                    <input type="hidden" name="id" value={slide.id} />
                    <input type="hidden" name="locale" value={locale} />
                    <button
                      type="submit"
                      className="rounded-full border-[3px] border-[#ff3b6f] bg-white px-5 py-2.5 text-sm font-black text-[#ff3b6f] shadow-[3px_4px_0_#ff3b6f] transition hover:-translate-y-0.5"
                    >
                      Supprimer
                    </button>
                  </form>
                </div>
              </div>
              <div className="mb-5 overflow-hidden rounded-[1rem] border-[2px] border-[#180d2b] bg-[#fff7ed] px-4 py-3 text-sm font-semibold text-[#6b4a2b]">
                {assetStatus.hint}
              </div>

              <SplashSlideForm locale={locale} initial={slide} />
            </section>
          );
        })}
      </div>
    </div>
  );
}
