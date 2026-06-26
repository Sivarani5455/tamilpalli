"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AuthState } from "@/types";

const loginSchema = z.object({
  email: z.email("Veuillez entrer une adresse email valide."),
  password: z.string().min(1, "Veuillez entrer votre mot de passe."),
  locale: z.string().min(2),
});

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Veuillez entrer votre nom complet."),
    email: z.email("Veuillez entrer une adresse email valide."),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caracteres."),
    confirmPassword: z.string().min(8, "Veuillez confirmer votre mot de passe."),
    locale: z.string().min(2),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas.",
  });

function missingConfigState() {
  return {
    ok: false,
    message: "Supabase environment variables are missing. Add them to .env.local before using live authentication.",
  } satisfies AuthState;
}

export async function loginAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    locale: formData.get("locale"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Formulaire de connexion invalide.",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return missingConfigState();
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      ok: false,
      message: "Email ou mot de passe incorrect.",
    };
  }

  redirect(`/${parsed.data.locale}/dashboard`);
}

export async function registerAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    locale: formData.get("locale"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Formulaire d'inscription invalide.",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return missingConfigState();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const redirectTo = `${siteUrl}/${parsed.data.locale}/auth/login`;

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        full_name: parsed.data.fullName,
        preferred_language: parsed.data.locale,
      },
    },
  });

  if (error) {
    return {
      ok: false,
      message: error.message,
    };
  }

  return {
    ok: true,
    message: "Compte cree. Verifiez votre email si la confirmation est active, puis connectez-vous.",
  };
}

export async function logoutAction(formData: FormData) {
  const locale = String(formData.get("locale") ?? "en");
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect(`/${locale}`);
}
