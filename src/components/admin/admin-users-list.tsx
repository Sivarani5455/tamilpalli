"use client";

import { useMemo, useState } from "react";

import { UserRoleForm } from "@/components/admin/management-forms";
import type { AdminUserSummary, Locale } from "@/types";

function UserBadge() {
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-[#180d2b] bg-[#7c3aed] text-white shadow-[3px_4px_0_#180d2b]">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20c1.4-4 12.6-4 14 0" />
      </svg>
    </span>
  );
}

export function AdminUsersList({
  locale,
  users,
}: {
  locale: Locale;
  users: AdminUserSummary[];
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredUsers = useMemo(() => {
    if (!normalizedQuery) {
      return users;
    }

    return users.filter((user) =>
      [
        user.fullName,
        user.email,
        user.role,
        user.preferredLanguage,
        user.currentPlan ?? "none",
        user.subscriptionStatus ?? "none",
        user.subscriptionExpiresAt ?? "no expiry",
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(normalizedQuery),
    );
  }, [normalizedQuery, users]);

  return (
    <>
      <div className="mt-5 rounded-[1.1rem] border-[3px] border-[#180d2b] bg-white px-4 py-3 shadow-[4px_5px_0_#180d2b]">
        <label className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[2px] border-[#180d2b] bg-[#ffc43d] text-[#180d2b]">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="6" />
              <path d="m16 16 4 4" />
            </svg>
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search users..."
            className="min-h-10 w-full bg-transparent text-sm font-bold text-[#180d2b] outline-none placeholder:text-[#8a6a9c]"
          />
        </label>
      </div>

      <div className="mt-6 grid gap-4">
        {users.length === 0 ? (
          <div className="rounded-[1.25rem] border-[3px] border-dashed border-[#180d2b] bg-white p-6 text-sm font-semibold leading-6 text-[#6b4f7c]">
            No users found. If accounts exist in Supabase Auth but not in profiles, create the profile rows or keep the service-role fallback enabled.
          </div>
        ) : null}

        {users.length > 0 && filteredUsers.length === 0 ? (
          <div className="rounded-[1.25rem] border-[3px] border-dashed border-[#180d2b] bg-white p-6 text-sm font-semibold leading-6 text-[#6b4f7c]">
            No users match this search.
          </div>
        ) : null}

        {filteredUsers.map((user) => (
          <article
            key={user.id}
            className="rounded-[1.25rem] border-[3px] border-[#180d2b] bg-white p-5 shadow-[6px_7px_0_#180d2b]"
          >
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="flex min-w-0 items-start gap-4">
                <UserBadge />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-display text-2xl font-black leading-tight text-[#180d2b]">
                      {user.fullName}
                    </h2>
                    <span className="rounded-full border-[2px] border-[#180d2b] bg-[#efe6ff] px-3 py-1 text-xs font-black uppercase text-[#7c3aed]">
                      {user.role}
                    </span>
                  </div>
                  <p className="mt-1 break-all text-sm font-semibold text-[#8a6a9c]">{user.email}</p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-[0.9rem] border-[2px] border-[#180d2b] bg-[#fff7ec] px-3 py-2">
                      <p className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-[#9a6a2f]">Language</p>
                      <p className="mt-1 text-sm font-black text-[#180d2b]">{user.preferredLanguage}</p>
                    </div>
                    <div className="rounded-[0.9rem] border-[2px] border-[#180d2b] bg-[#e7fff3] px-3 py-2">
                      <p className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-[#14865f]">Plan</p>
                      <p className="mt-1 text-sm font-black text-[#180d2b]">{user.currentPlan ?? "none"}</p>
                    </div>
                    <div className="rounded-[0.9rem] border-[2px] border-[#180d2b] bg-[#fff5cf] px-3 py-2">
                      <p className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-[#9a6a2f]">Status</p>
                      <p className="mt-1 text-sm font-black text-[#180d2b]">{user.subscriptionStatus ?? "none"}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-[#8a6a9c]">
                    Expires: {user.subscriptionExpiresAt ?? "no expiry"}
                  </p>
                </div>
              </div>

              <UserRoleForm locale={locale} user={user} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
