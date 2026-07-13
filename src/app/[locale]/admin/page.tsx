import Link from "next/link";

import { requireAdminUser } from "@/lib/auth";
import { getLocaleOrThrow } from "@/lib/i18n";

const adminLinks = [
  { href: "/admin/users", title: "Users", description: "Inspect roles, plans and renewal windows.", icon: "user", color: "#7c3aed" },
  { href: "/admin/content", title: "Content access", description: "Map plans to categories and lock premium content.", icon: "card", color: "#ff3b6f" },
  { href: "/admin/splash", title: "Splash admin", description: "Manage the intro screen and unlimited fullscreen splash images.", icon: "image", color: "#f5a400" },
  { href: "/admin/dictionary", title: "Dictionary admin", description: "Manage multilingual vocabulary entries and image references.", icon: "book", color: "#22a6b3" },
  { href: "/admin/word-search", title: "Word Search admin", description: "Manage grids, scores and Tamil word packs.", icon: "grid", color: "#18b66f" },
  { href: "/admin/fill-in-the-blanks", title: "Fill in the Blanks admin", description: "Edit questions, options and grammar notes.", icon: "lines", color: "#4f7cff" },
  { href: "/admin/image-hunt", title: "Image Hunt admin", description: "Control hotspots, prompts and hint rules.", icon: "search", color: "#7c3aed" },
  { href: "/admin/word-hunt", title: "Word Hunt admin", description: "Manage timed Tamil word tapping games.", icon: "clock", color: "#ff3b6f" },
  { href: "/admin/kathaigal", title: "Kathaigal admin", description: "Write Tamil stories with paragraph images.", icon: "book", color: "#20bf73" },
  { href: "/admin/thirukkural", title: "Thirukkural admin", description: "Create kurals, porul, quiz and fill-blank practice.", icon: "book", color: "#f5a400" },
];

function AdminIcon({ name }: { name: string }) {
  const common = "h-5 w-5";

  if (name === "user") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20c1.4-4 12.6-4 14 0" />
      </svg>
    );
  }

  if (name === "card") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="6" width="14" height="12" rx="2" />
        <path d="M8 10h8M8 14h5" />
      </svg>
    );
  }

  if (name === "image") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="6" width="16" height="12" rx="2" />
        <path d="m7 15 3-3 2 2 3-4 2 5" />
      </svg>
    );
  }

  if (name === "book") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 5h8a3 3 0 0 1 3 3v11H9a3 3 0 0 0-3 3V6a1 1 0 0 1 1-1Z" />
        <path d="M9 9h6M9 13h5" />
      </svg>
    );
  }

  if (name === "grid") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="5" width="5" height="5" rx="1" />
        <rect x="14" y="5" width="5" height="5" rx="1" />
        <rect x="5" y="14" width="5" height="5" rx="1" />
        <rect x="14" y="14" width="5" height="5" rx="1" />
      </svg>
    );
  }

  if (name === "lines") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 8h10M7 12h8M7 16h6" />
      </svg>
    );
  }

  if (name === "clock") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="7" />
        <path d="M12 8v4l3 2" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  const admin = await requireAdminUser(locale);

  return (
    <div className="mx-auto max-w-7xl px-2 py-4 sm:px-4 lg:px-6">
      <div className="relative overflow-hidden rounded-[1.65rem] border-[3px] border-[#180d2b] bg-[#1b0b31] p-8 text-white shadow-[8px_9px_0_#ffc43d] sm:p-9">
        <span className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-[#7c3aed]/45" />
        <p className="relative text-xs font-black uppercase tracking-[0.24em] text-[#ffc43d]">• Admin</p>
        <h1 className="relative mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] font-black leading-none text-white">
          {admin.fullName}
        </h1>
        <p className="relative mt-4 max-w-3xl text-sm font-semibold leading-6 text-[#f4e8ff] sm:text-base">
          Admin routes are scaffolded behind a dedicated helper and are intended to be backed by Supabase role checks plus RLS.
        </p>
      </div>
      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {adminLinks.map((item) => (
          <Link
            key={item.href}
            href={`/${locale}${item.href}`}
            className="group rounded-[1.25rem] border-[3px] border-[#180d2b] bg-white p-5 shadow-[6px_7px_0_#180d2b] transition hover:-translate-y-1 hover:shadow-[8px_9px_0_#180d2b]"
          >
            <span
              className="mb-7 flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-[#180d2b] text-white shadow-[3px_4px_0_#180d2b]"
              style={{ backgroundColor: item.color }}
            >
              <AdminIcon name={item.icon} />
            </span>
            <h2 className="font-display text-2xl font-black leading-tight text-[#180d2b]">{item.title}</h2>
            <p className="mt-2 max-w-[16rem] text-sm font-semibold leading-5 text-[#6b4f7c]">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
