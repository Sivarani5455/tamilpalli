import { redirect } from "next/navigation";

import { demoSubscription, plans } from "@/lib/mock-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PlanSlug, Subscription } from "@/types";

type SubscriptionPlanRelation =
  | {
      slug: Subscription["planSlug"];
    }
  | Array<{
      slug: Subscription["planSlug"];
    }>;

type UserSubscriptionRow = {
  id: string;
  status: Subscription["status"];
  started_at: string | null;
  expires_at: string | null;
  subscription_plans: SubscriptionPlanRelation | null;
};

function extractPlanSlug(relation: SubscriptionPlanRelation | null) {
  if (!relation) {
    return null;
  }

  if (Array.isArray(relation)) {
    return relation[0]?.slug ?? null;
  }

  return relation.slug;
}

function mapSubscriptionRow(data: UserSubscriptionRow | null) {
  if (!data) {
    return null;
  }

  const planSlug = extractPlanSlug(data.subscription_plans);

  if (!planSlug || !data.started_at || !data.expires_at) {
    return null;
  }

  return {
    id: data.id,
    planSlug,
    status: data.status,
    startedAt: data.started_at,
    expiresAt: data.expires_at,
  } satisfies Subscription;
}

export async function getActiveSubscription() {
  const hasSupabaseEnv = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  if (!hasSupabaseEnv) {
    return demoSubscription;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("user_subscriptions")
    .select("id, status, started_at, expires_at, subscription_plans!inner(slug)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle<UserSubscriptionRow>();

  const directSubscription = mapSubscriptionRow(data);

  if (directSubscription) {
    return directSubscription;
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return null;
  }

  const { data: adminData } = await adminClient
    .from("user_subscriptions")
    .select("id, status, started_at, expires_at, subscription_plans!inner(slug)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle<UserSubscriptionRow>();

  return mapSubscriptionRow(adminData);
}

export async function getPlans() {
  return plans;
}

export async function requireActiveSubscription(locale: string) {
  const subscription = await getActiveSubscription();

  if (!subscription) {
    redirect(`/${locale}/pricing`);
  }

  return subscription;
}

export function planRank(plan: PlanSlug) {
  return {
    discovery: 1,
    standard: 2,
    elite: 3,
  }[plan];
}
