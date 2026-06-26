import { demoSubscription, demoUser } from "@/lib/mock-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import type { AdminUserSummary, ContentCategoryAccess, PlanSlug, Role } from "@/types";

import { getContentCategories } from "./content";

function normalizePlanRows(
  value:
    | Array<{
        slug: PlanSlug;
      }>
    | {
        slug: PlanSlug;
      }
    | null
    | undefined,
) {
  if (Array.isArray(value)) {
    return value;
  }

  return value ? [value] : [];
}

type ProfileWithSubscriptionRow = {
  user_id: string;
  full_name: string | null;
  email: string;
  role: Role;
  preferred_language: AdminUserSummary["preferredLanguage"];
};

type UserSubscriptionRow = {
  user_id: string;
  status: AdminUserSummary["subscriptionStatus"];
  started_at: string | null;
  expires_at: string | null;
  subscription_plans:
    | Array<{
        slug: PlanSlug;
      }>
    | {
        slug: PlanSlug;
      }
    | null;
};

type AccessRow = {
  content_category_id: string;
  is_enabled: boolean;
  subscription_plans:
    | Array<{
        slug: PlanSlug;
      }>
    | {
        slug: PlanSlug;
      }
    | null;
};

type AuthUserRow = {
  id: string;
  email?: string | null;
  user_metadata?: {
    full_name?: string;
    preferred_language?: AdminUserSummary["preferredLanguage"];
  };
};

export async function getAdminUsers() {
  if (!hasSupabaseEnv()) {
    return [
      {
        id: demoUser.id,
        fullName: demoUser.fullName,
        email: demoUser.email,
        role: demoUser.role,
        preferredLanguage: demoUser.preferredLanguage,
        currentPlan: demoSubscription.planSlug,
        subscriptionStatus: demoSubscription.status,
        subscriptionExpiresAt: demoSubscription.expiresAt,
      },
    ] satisfies AdminUserSummary[];
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return [];
  }

  const { data: profilesData } = await supabase
    .from("profiles")
    .select("user_id, full_name, email, role, preferred_language")
    .order("created_at", { ascending: false });

  const { data: subscriptionsData } = await supabase
    .from("user_subscriptions")
    .select("user_id, status, started_at, expires_at, subscription_plans!inner(slug)")
    .order("expires_at", { ascending: false });

  const latestSubscriptionByUser = new Map<string, UserSubscriptionRow>();

  ((subscriptionsData ?? []) as UserSubscriptionRow[]).forEach((row) => {
    if (!latestSubscriptionByUser.has(row.user_id)) {
      latestSubscriptionByUser.set(row.user_id, row);
    }
  });

  const mappedProfiles = ((profilesData ?? []) as ProfileWithSubscriptionRow[]).map((row) => {
    const currentSubscription = latestSubscriptionByUser.get(row.user_id);

    return {
      id: row.user_id,
      fullName: row.full_name ?? row.email ?? "User",
      email: row.email,
      role: row.role,
      preferredLanguage: row.preferred_language,
      currentPlan: normalizePlanRows(currentSubscription?.subscription_plans)[0]?.slug ?? null,
      subscriptionStatus: currentSubscription?.status ?? null,
      subscriptionExpiresAt: currentSubscription?.expires_at ?? null,
    } satisfies AdminUserSummary;
  });

  if (mappedProfiles.length > 0) {
    return mappedProfiles;
  }

  const { data: authUsersData, error: authUsersError } =
    await supabase.auth.admin.listUsers();

  if (authUsersError || !authUsersData?.users) {
    return [];
  }

  return authUsersData.users.map((user) => {
    const authUser = user as AuthUserRow;

    return {
      id: authUser.id,
      fullName: authUser.user_metadata?.full_name ?? authUser.email ?? "User",
      email: authUser.email ?? "",
      role: "user",
      preferredLanguage: authUser.user_metadata?.preferred_language ?? "en",
      currentPlan: null,
      subscriptionStatus: null,
      subscriptionExpiresAt: null,
    } satisfies AdminUserSummary;
  });
}

export async function getAdminCategoryAccess() {
  const categories = await getContentCategories();

  if (!hasSupabaseEnv()) {
    return categories.map((category) => ({
      ...category,
      enabledPlans:
        category.requiredPlan === "discovery"
          ? ["discovery", "standard", "elite"]
          : category.requiredPlan === "standard"
            ? ["standard", "elite"]
            : ["elite"],
    })) satisfies ContentCategoryAccess[];
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("content_plan_access")
    .select("content_category_id, is_enabled, subscription_plans(slug)");

  const accessByCategory = new Map<string, PlanSlug[]>();

  ((data ?? []) as AccessRow[]).forEach((row) => {
    const enabled = row.is_enabled ? normalizePlanRows(row.subscription_plans).map((plan) => plan.slug) : [];
    accessByCategory.set(row.content_category_id, [
      ...(accessByCategory.get(row.content_category_id) ?? []),
      ...enabled,
    ]);
  });

  return categories.map((category) => ({
    ...category,
    enabledPlans: Array.from(new Set(accessByCategory.get(category.id) ?? [])),
  })) satisfies ContentCategoryAccess[];
}
