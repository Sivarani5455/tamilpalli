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

function getSlideAssetStatus(imageUrl: string) {
  const isRemote = /^https?:\/\//i.test(imageUrl);

  if (isRemote) {
    return {
      label: "URL distante",
      tone: "bg-sky-100 text-sky-700",
      hint: imageUrl,
    };
  }

  if (!imageUrl.startsWith("/")) {
    return {
      label: "Chemin invalide",
      tone: "bg-rose-100 text-rose-700",
      hint: "Utilise /nom-image.png ou une URL https://...",
    };
  }

  const localPath = path.join(process.cwd(), "public", imageUrl.replace(/^\/+/, ""));
  const exists = existsSync(localPath);

  return exists
    ? {
        label: "Image trouvée",
        tone: "bg-emerald-100 text-emerald-700",
        hint: localPath,
      }
    : {
        label: "Image introuvable",
        tone: "bg-rose-100 text-rose-700",
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
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">Splash admin</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">Gestion des images splash</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Ajoute autant d&apos;écrans splash que tu veux. Les slides sont triés par ordre croissant. Le type
          <strong> intro</strong> garde la mise en page encadrée, le type <strong>plein écran</strong> affiche
          l&apos;image sur toute la page.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={`/${locale}`}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Tester le splash
          </Link>
          <span className="rounded-full border border-slate-200 px-4 py-3 text-sm text-slate-600">
            Les images locales doivent exister dans le dossier `public` du projet.
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
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)]"
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                    {slide.kind}
                  </span>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                    ordre {slide.sortOrder}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      slide.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {slide.isActive ? "actif" : "inactif"}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${assetStatus.tone}`}>
                    {assetStatus.label}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <form action={moveHomeSplashSlideAction}>
                    <input type="hidden" name="id" value={slide.id} />
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                    >
                      Monter
                    </button>
                  </form>

                  <form action={moveHomeSplashSlideAction}>
                    <input type="hidden" name="id" value={slide.id} />
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                    >
                      Descendre
                    </button>
                  </form>

                  <form action={deleteHomeSplashSlideAction}>
                    <input type="hidden" name="id" value={slide.id} />
                    <input type="hidden" name="locale" value={locale} />
                    <button
                      type="submit"
                      className="rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600"
                    >
                      Supprimer
                    </button>
                  </form>
                </div>
              </div>
              <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
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
