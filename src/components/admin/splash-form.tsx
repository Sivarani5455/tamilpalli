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

  return (
    <p
      className={`rounded-[1rem] border-[2px] px-4 py-3 text-sm font-black ${
        ok
          ? "border-[#14b86a] bg-[#dcfce7] text-[#047857]"
          : "border-[#ff3b6f] bg-[#ffe4ee] text-[#be123c]"
      }`}
    >
      {message}
    </p>
  );
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
      className="rounded-[1.5rem] border-[3px] border-[#180d2b] bg-white p-5 shadow-[6px_7px_0_#180d2b]"
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" defaultValue={initial?.id} />

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#7c3aed]">
            {initial ? "Slide existant" : "Nouveau slide"}
          </p>
          <h2 className="mt-1 font-display text-2xl font-black text-[#180d2b]">
            {initial ? `${initial.kind} · ordre ${initial.sortOrder}` : "Ajouter un slide splash"}
          </h2>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <label className="space-y-1.5 md:col-span-2">
          <span className="text-xs font-black uppercase tracking-[0.22em] text-[#8a6a9c]">Image URL</span>
          <input
            name="imageUrl"
            defaultValue={initial?.imageUrl ?? ""}
            className="w-full rounded-[1rem] border-[2px] border-[#180d2b] bg-white px-4 py-3 text-sm font-semibold text-[#180d2b] shadow-[3px_4px_0_#180d2b] outline-none transition focus:-translate-y-0.5 focus:bg-[#fff7ed]"
            placeholder="https://... ou /thiruvalluvar-splash-6.png"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-black uppercase tracking-[0.22em] text-[#8a6a9c]">Ordre</span>
          <input
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={initial?.sortOrder ?? 0}
            className="w-full rounded-[1rem] border-[2px] border-[#180d2b] bg-white px-4 py-3 text-sm font-semibold text-[#180d2b] shadow-[3px_4px_0_#180d2b] outline-none transition focus:-translate-y-0.5 focus:bg-[#fff7ed]"
          />
        </label>
      </div>

      <div className="mt-5 rounded-[1rem] border-[2px] border-[#f59e0b] bg-[#fff7d6] px-4 py-4 text-sm font-semibold leading-7 text-[#6b4a2b]">
        <p className="font-black uppercase tracking-[0.16em] text-[#c2410c]">Important pour localhost</p>
        <p className="mt-2">
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
          <span className="text-xs font-black uppercase tracking-[0.22em] text-[#8a6a9c]">Type d&apos;écran</span>
          <select
            name="kind"
            defaultValue={initial?.kind ?? "fullscreen"}
            className="w-full rounded-[1rem] border-[2px] border-[#180d2b] bg-white px-4 py-3 text-sm font-semibold text-[#180d2b] shadow-[3px_4px_0_#180d2b] outline-none transition focus:-translate-y-0.5 focus:bg-[#fff7ed]"
          >
            <option value="intro">Intro encadrée</option>
            <option value="fullscreen">Image plein écran</option>
          </select>
        </label>

        <label className="flex items-center gap-3 rounded-[1rem] border-[2px] border-[#180d2b] bg-[#f6f0ff] px-4 py-3 text-sm font-black text-[#180d2b] shadow-[3px_4px_0_#180d2b]">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={initial?.isActive ?? true}
            className="h-5 w-5 accent-[#7c3aed]"
          />
          <span>Slide actif</span>
        </label>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          disabled={pending}
          className="rounded-full border-[3px] border-[#180d2b] bg-[#20bf73] px-7 py-3 text-sm font-black text-white shadow-[4px_5px_0_#180d2b] transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {initial ? "Enregistrer" : "Ajouter"}
        </button>
      </div>

      {initial?.imageUrl ? (
        <div className="mt-6 rounded-[1.25rem] border-[2px] border-[#180d2b] bg-[#fff7ed] p-4">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8a6a9c]">Aperçu</p>
          <div className="mt-3 overflow-hidden rounded-[1rem] border-[2px] border-[#180d2b] bg-white">
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
