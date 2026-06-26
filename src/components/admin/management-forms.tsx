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
        className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700"
      >
        <option value="user">user</option>
        <option value="admin">admin</option>
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-slate-950 px-3 py-2 text-sm text-white disabled:opacity-60"
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
            className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700"
          >
            <input
              type="checkbox"
              name="enabledPlans"
              value={plan.slug}
              defaultChecked={category.enabledPlans.includes(plan.slug)}
            />
            <span>{plan.name}</span>
          </label>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-slate-950 px-4 py-2 text-sm text-white disabled:opacity-60"
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
