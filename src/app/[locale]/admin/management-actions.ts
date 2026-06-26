"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import type { AuthState, ContentType, PlanSlug, Role } from "@/types";

export async function updateUserRoleAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const locale = String(formData.get("locale") ?? "en");
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "user") as Role;

  await requireAdminUser(locale);

  if (!hasSupabaseEnv()) {
    return {
      ok: true,
      message: "Role update acknowledged in scaffold mode. Add Supabase env vars to persist it.",
    };
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      ok: false,
      message: "Supabase service role key is missing.",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("user_id", userId);

  if (error) {
    return {
      ok: false,
      message: error.message,
    };
  }

  revalidatePath(`/${locale}/admin/users`);

  return {
    ok: true,
    message: "User role updated.",
  };
}

export async function updateCategoryAccessAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const locale = String(formData.get("locale") ?? "en");
  let categoryId = String(formData.get("categoryId") ?? "");
  const categorySlug = String(formData.get("categorySlug") ?? "");
  const categoryTitle = String(formData.get("categoryTitle") ?? "");
  const categoryDescription = String(formData.get("categoryDescription") ?? "");
  const categoryType = String(formData.get("categoryType") ?? "exercise") as ContentType;

  await requireAdminUser(locale);

  if (!hasSupabaseEnv()) {
    return {
      ok: true,
      message: "Access changes acknowledged in scaffold mode. Add Supabase env vars to persist them.",
    };
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      ok: false,
      message: "Supabase service role key is missing.",
    };
  }

  if (!categorySlug) {
    return {
      ok: false,
      message: "Category slug is missing.",
    };
  }

  const { data: existingCategory } = await supabase
    .from("content_categories")
    .select("id")
    .eq("slug", categorySlug)
    .maybeSingle<{ id: string }>();

  if (existingCategory?.id) {
    categoryId = existingCategory.id;
  } else {
    const { data: insertedCategory, error: insertCategoryError } = await supabase
      .from("content_categories")
      .insert({
        slug: categorySlug,
        title: categoryTitle || categorySlug,
        description: categoryDescription || categoryTitle || categorySlug,
        type: categoryType,
        is_active: true,
      })
      .select("id")
      .single<{ id: string }>();

    if (insertCategoryError || !insertedCategory?.id) {
      return {
        ok: false,
        message: insertCategoryError?.message ?? "Unable to create the content category.",
      };
    }

    categoryId = insertedCategory.id;
  }

  const { data: plansData, error: plansError } = await supabase
    .from("subscription_plans")
    .select("id, slug");

  if (plansError) {
    return {
      ok: false,
      message: plansError.message,
    };
  }

  const selectedPlans = (["discovery", "standard", "elite"] as PlanSlug[]).filter((plan) =>
    formData.getAll("enabledPlans").includes(plan),
  );

  for (const plan of plansData ?? []) {
    const { data: existingRows } = await supabase
      .from("content_plan_access")
      .select("id")
      .eq("content_category_id", categoryId)
      .eq("plan_id", plan.id)
      .limit(1);

    const isEnabled = selectedPlans.includes(plan.slug as PlanSlug);

    if ((existingRows?.length ?? 0) > 0) {
      await supabase
        .from("content_plan_access")
        .update({ is_enabled: isEnabled })
        .eq("content_category_id", categoryId)
        .eq("plan_id", plan.id);
    } else {
      await supabase.from("content_plan_access").insert({
        content_category_id: categoryId,
        plan_id: plan.id,
        is_enabled: isEnabled,
      });
    }
  }

  revalidatePath(`/${locale}/admin/content`);

  return {
    ok: true,
    message: "Content access updated.",
  };
}
