import Link from "next/link";

import { requireAdminUser } from "@/lib/auth";
import { getLocaleOrThrow } from "@/lib/i18n";

const adminLinks = [
  { href: "/admin/users", title: "Users", description: "Inspect roles, plans and renewal windows." },
  { href: "/admin/content", title: "Content access", description: "Map plans to categories and lock premium content." },
  { href: "/admin/splash", title: "Splash admin", description: "Manage the intro screen and unlimited fullscreen splash images." },
  { href: "/admin/dictionary", title: "Dictionary admin", description: "Manage multilingual vocabulary entries and image references." },
  { href: "/admin/word-search", title: "Word Search admin", description: "Manage grids, scores and Tamil word packs." },
  { href: "/admin/fill-in-the-blanks", title: "Fill in the Blanks admin", description: "Edit questions, options and grammar notes." },
  { href: "/admin/image-hunt", title: "Image Hunt admin", description: "Control hotspots, prompts and hint rules." },
];

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  const admin = await requireAdminUser(locale);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="rounded-[2.5rem] bg-slate-950 p-8 text-white">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Admin</p>
        <h1 className="mt-3 font-display text-5xl">{admin.fullName}</h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-300">
          Admin routes are scaffolded behind a dedicated helper and are intended to be backed by Supabase role checks plus RLS.
        </p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {adminLinks.map((item) => (
          <Link key={item.href} href={`/${locale}${item.href}`} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-3xl text-slate-950">{item.title}</h2>
            <p className="mt-3 text-sm text-slate-600">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
