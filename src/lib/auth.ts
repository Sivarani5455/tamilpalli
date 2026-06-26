import { redirect } from "next/navigation";

import { demoUser } from "@/lib/mock-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppUser } from "@/types";

type ProfileRow = {
  full_name: string;
  email: string;
  role: "user" | "admin";
  preferred_language: AppUser["preferredLanguage"];
};

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function getCurrentUser() {
  if (!hasSupabaseEnv()) {
    return demoUser;
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role, preferred_language")
    .eq("user_id", user.id)
    .maybeSingle<ProfileRow>();

  let resolvedProfile = profile;

  if (!resolvedProfile) {
    const adminClient = createSupabaseAdminClient();

    if (adminClient) {
      const { data: adminProfile } = await adminClient
        .from("profiles")
        .select("full_name, email, role, preferred_language")
        .eq("user_id", user.id)
        .maybeSingle<ProfileRow>();

      resolvedProfile = adminProfile ?? resolvedProfile;
    }
  }

  return {
    id: user.id,
    fullName: resolvedProfile?.full_name ?? user.user_metadata.full_name ?? user.email ?? "User",
    email: resolvedProfile?.email ?? user.email ?? "",
    role: resolvedProfile?.role ?? "user",
    preferredLanguage: resolvedProfile?.preferred_language ?? "en",
  } satisfies AppUser;
}

export async function requireUser(locale: string) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  return user;
}

export async function requireAdminUser(locale: string) {
  const user = await requireUser(locale);

  if (user.role !== "admin") {
    redirect(`/${locale}/unauthorized`);
  }

  return user;
}
