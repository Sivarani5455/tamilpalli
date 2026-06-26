import { UserRoleForm } from "@/components/admin/management-forms";
import { getAdminUsers } from "@/lib/admin";
import { requireAdminUser } from "@/lib/auth";
import { getLocaleOrThrow } from "@/lib/i18n";

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireAdminUser(locale);
  const users = await getAdminUsers();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-5xl text-slate-950">Users</h1>
      <div className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white">
        <div className="grid grid-cols-5 gap-4 border-b border-slate-200 px-6 py-4 text-xs uppercase tracking-[0.25em] text-slate-500">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Plan</span>
          <span>Status</span>
        </div>
        {users.length === 0 ? (
          <div className="px-6 py-10 text-sm text-slate-500">
            No users found. If accounts exist in Supabase Auth but not in `profiles`, create the profile rows or keep the service-role fallback enabled.
          </div>
        ) : null}
        {users.map((user) => (
          <div key={user.id} className="grid grid-cols-5 gap-4 border-b border-slate-100 px-6 py-5 text-sm text-slate-700 last:border-b-0">
            <div>
              <p className="font-medium text-slate-950">{user.fullName}</p>
              <p className="text-xs text-slate-500">{user.preferredLanguage}</p>
            </div>
            <span>{user.email}</span>
            <UserRoleForm locale={locale} user={user} />
            <div>
              <p>{user.currentPlan ?? "none"}</p>
              <p className="text-xs text-slate-500">{user.subscriptionExpiresAt ?? "no expiry"}</p>
            </div>
            <span>{user.subscriptionStatus ?? "none"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
