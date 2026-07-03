import { AdminUsersList } from "@/components/admin/admin-users-list";
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
    <div className="mx-auto max-w-5xl px-2 py-6 sm:px-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#7c3aed]">Admin</p>
          <h1 className="mt-1 font-display text-[clamp(1.9rem,4vw,2.6rem)] font-black leading-tight text-[#180d2b]">
            Users
          </h1>
        </div>
        <span className="rounded-full border-[3px] border-[#180d2b] bg-[#c6ff2e] px-4 py-2 text-sm font-black text-[#180d2b] shadow-[3px_4px_0_#180d2b]">
          {users.length} users
        </span>
      </div>

      <AdminUsersList locale={locale} users={users} />
    </div>
  );
}
