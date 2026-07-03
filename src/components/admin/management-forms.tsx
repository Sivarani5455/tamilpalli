"use client";

import { useActionState } from "react";

import {
  updateCategoryAccessAction,
  updateUserRoleAction,
} from "@/app/[locale]/admin/management-actions";
import { initialCrudState } from "@/lib/action-states";
import { plans } from "@/lib/mock-data";
import type { AdminUserSummary, ContentCategoryAccess, Locale } from "@/types";

export function UserRoleForm({
  locale,
  user,
}: {
  locale: Locale;
  user: AdminUserSummary;
}) {
  const [state, action, pending] = useActionState(updateUserRoleAction, initialCrudState);

  return (
    <form action={action} className="flex items-center gap-3">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="userId" value={user.id} />
      <select
        name="role"
        defaultValue={user.role}
        className="rounded-full border-[2px] border-[#180d2b] bg-white px-3 py-2 text-sm font-bold text-[#180d2b] outline-none"
      >
        <option value="user">user</option>
        <option value="admin">admin</option>
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full border-[2px] border-[#180d2b] bg-[#ffc43d] px-3 py-2 text-sm font-black text-[#180d2b] shadow-[2px_3px_0_#180d2b] disabled:opacity-60"
      >
        Save
      </button>
      {state.message ? (
        <span className={`text-xs ${state.ok ? "text-emerald-700" : "text-rose-600"}`}>
          {state.message}
        </span>
      ) : null}
    </form>
  );
}

export function CategoryAccessForm({
  locale,
  category,
}: {
  locale: Locale;
  category: ContentCategoryAccess;
}) {
  const [state, action, pending] = useActionState(updateCategoryAccessAction, initialCrudState);

  return (
    <form action={action} className="mt-5 space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="categoryId" value={category.id} />
      <input type="hidden" name="categorySlug" value={category.slug} />
      <input type="hidden" name="categoryTitle" value={category.title} />
      <input type="hidden" name="categoryDescription" value={category.description} />
      <input type="hidden" name="categoryType" value={category.type} />
      <div className="flex flex-wrap gap-3">
        {plans.map((plan) => (
          <label
            key={plan.id}
            className="flex items-center gap-2 rounded-full border-[2px] border-[#180d2b] bg-white px-4 py-2 text-sm font-black text-[#180d2b] shadow-[2px_3px_0_#180d2b]"
          >
            <input
              type="checkbox"
              name="enabledPlans"
              value={plan.slug}
              defaultChecked={category.enabledPlans.includes(plan.slug)}
              className="h-4 w-4 accent-[#7c3aed]"
            />
            <span>{plan.name}</span>
          </label>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full border-[3px] border-[#180d2b] bg-[#ffc43d] px-5 py-2.5 text-sm font-black text-[#180d2b] shadow-[3px_4px_0_#180d2b] disabled:opacity-60"
        >
          Save access
        </button>
        {state.message ? (
          <span className={`text-xs ${state.ok ? "text-emerald-700" : "text-rose-600"}`}>
            {state.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}
