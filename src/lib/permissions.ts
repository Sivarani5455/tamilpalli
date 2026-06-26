import { redirect } from "next/navigation";

import { getContentCategories } from "@/lib/content";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { requireActiveSubscription } from "@/lib/subscriptions";
import { getActiveSubscription } from "@/lib/subscriptions";
import { planRank } from "@/lib/subscriptions";
import type { ContentCategory, PlanSlug } from "@/types";

export function canAccessPlan(currentPlan: PlanSlug, requiredPlan: PlanSlug) {
  return planRank(currentPlan) >= planRank(requiredPlan);
}

export function canAccessCategory(currentPlan: PlanSlug, category: ContentCategory) {
  if (category.accessConfigured) {
    return category.enabledPlans?.includes(currentPlan) ?? false;
  }

  return canAccessPlan(currentPlan, category.requiredPlan);
}

export async function getCategoryAccess(plan: PlanSlug) {
  const categories = await getContentCategories();

  return categories.map((category) => ({
    ...category,
    accessible: canAccessCategory(plan, category),
  }));
}

export async function getOptionalCategoryAccess(categorySlug: string) {
  const categories = await getContentCategories();
  const category = categories.find((entry) => entry.slug === categorySlug);

  if (!category) {
    return {
      category: null,
      accessible: false,
      user: null,
      subscription: null,
    };
  }

  const user = await getCurrentUser();
  const subscription = user ? await getActiveSubscription() : null;

  return {
    category,
    accessible: subscription ? canAccessCategory(subscription.planSlug, category) : false,
    user,
    subscription,
  };
}

export function getUpgradeMessage(category: ContentCategory) {
  if (category.accessConfigured && category.enabledPlans && category.enabledPlans.length > 0) {
    return `This content is available for: ${category.enabledPlans.join(", ")}.`;
  }

  if (category.accessConfigured) {
    return "This content is currently disabled for all subscription plans.";
  }

  return `This content requires the ${category.requiredPlan} plan. Upgrade to unlock it.`;
}

export async function requireCategoryAccess(locale: string, categorySlug: string) {
  await requireUser(locale);
  const subscription = await requireActiveSubscription(locale);
  const categories = await getContentCategories();
  const category = categories.find((entry) => entry.slug === categorySlug);

  if (!category) {
    redirect(`/${locale}/unauthorized`);
  }

  if (!canAccessCategory(subscription.planSlug, category)) {
    const params = new URLSearchParams({
      content: category.title,
    });

    if (category.accessConfigured && category.enabledPlans && category.enabledPlans.length > 0) {
      params.set("plans", category.enabledPlans.join(","));
      params.set("focus", category.enabledPlans[0]);
    }

    if (category.accessConfigured && (category.enabledPlans?.length ?? 0) === 0) {
      params.set("disabled", "1");
    }

    redirect(`/${locale}/pricing?${params.toString()}`);
  }

  return {
    category,
    subscription,
  };
}
