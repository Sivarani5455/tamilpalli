"use client";

import Image from "next/image";
import { useActionState } from "react";

import { upsertHomeSplashSlideAction } from "@/app/[locale]/admin/content-actions";
import { initialCrudState } from "@/lib/action-states";
import type { Locale, SplashSlide } from "@/types";

function StatusMessage({ ok, message }: { ok: boolean; message: string }) {
  if (!message) {
    return null;
  }

  return <p className={`text-sm ${ok ? "text-emerald-700" : "text-rose-600"}`}>{message}</p>;
}

export function SplashSlideForm({
  locale,
  initial,
}: {
  locale: Locale;
  initial?: SplashSlide | null;
}) {
  const [state, action, pending] = useActionState(upsertHomeSplashSlideAction, initialCrudState);

  return (
    <form
      action={action}
      className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" defaultValue={initial?.id} />

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            {initial ? "Slide existant" : "Nouveau slide"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            {initial ? `${initial.kind} · ordre ${initial.sortOrder}` : "Ajouter un slide splash"}
          </h2>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <label className="space-y-1.5 md:col-span-2">
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Image URL</span>
          <input
            name="imageUrl"
            defaultValue={initial?.imageUrl ?? ""}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            placeholder="https://... ou /thiruvalluvar-splash-6.png"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Ordre</span>
          <input
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={initial?.sortOrder ?? 0}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
        </label>
      </div>

      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-7 text-amber-900">
        <p className="font-semibold">Important pour localhost</p>
        <p className="mt-1">
          Un chemin comme <code>/thiruvalluvar-splash.png</code> fonctionne seulement si le fichier est dans le
          dossier <code>public</code> du projet. Une image stockée uniquement sur le Bureau n&apos;est pas servie
          automatiquement par Next.js.
        </p>
        <p className="mt-1">
          Utilise soit un fichier dans <code>public</code>, soit une URL publique distante.
        </p>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Type d&apos;écran</span>
          <select
            name="kind"
            defaultValue={initial?.kind ?? "fullscreen"}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          >
            <option value="intro">Intro encadrée</option>
            <option value="fullscreen">Image plein écran</option>
          </select>
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
          <input type="checkbox" name="isActive" defaultChecked={initial?.isActive ?? true} />
          <span>Slide actif</span>
        </label>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          disabled={pending}
          className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {initial ? "Enregistrer" : "Ajouter"}
        </button>
      </div>

      {initial?.imageUrl ? (
        <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Aperçu</p>
          <div className="mt-3 overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={initial.imageUrl}
                alt="Splash preview"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-4">
        <StatusMessage ok={state.ok} message={state.message} />
      </div>
    </form>
  );
}
