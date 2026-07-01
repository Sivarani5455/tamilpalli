"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction, registerAction } from "@/app/[locale]/auth/actions";
import { initialAuthState } from "@/lib/action-states";
import type { Locale } from "@/types";

type AuthCopy = {
  loginTitle: string;
  registerTitle: string;
  loginSubtitle: string;
  registerSubtitle: string;
  loginTab: string;
  registerTab: string;
  fullName: string;
  fullNamePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  password: string;
  passwordChoose: string;
  passwordPlaceholder: string;
  confirmPassword: string;
  submitLogin: string;
  submitRegister: string;
  forgotPassword: string;
  continueWith: string;
};

const authCopy: Record<Locale, AuthCopy> = {
  en: {
    loginTitle: "Sign in",
    registerTitle: "Create account",
    loginSubtitle: "Access your account in a few seconds",
    registerSubtitle: "Create your account and start learning in a few seconds",
    loginTab: "Sign in",
    registerTab: "Create account",
    fullName: "Full name",
    fullNamePlaceholder: "Your full name",
    email: "Email",
    emailPlaceholder: "example@email.com",
    password: "Password",
    passwordChoose: "Choose a password",
    passwordPlaceholder: "........",
    confirmPassword: "Confirm password",
    submitLogin: "Sign in",
    submitRegister: "Create account",
    forgotPassword: "Forgot password?",
    continueWith: "or continue with",
  },
  fr: {
    loginTitle: "Connexion",
    registerTitle: "Créer un compte",
    loginSubtitle: "Accédez à votre compte en quelques secondes",
    registerSubtitle: "Créez votre compte et commencez à apprendre en quelques secondes",
    loginTab: "Se connecter",
    registerTab: "Créer un compte",
    fullName: "Nom complet",
    fullNamePlaceholder: "Votre nom complet",
    email: "Email",
    emailPlaceholder: "exemple@email.com",
    password: "Mot de passe",
    passwordChoose: "Choisissez un mot de passe",
    passwordPlaceholder: "........",
    confirmPassword: "Confirmez le mot de passe",
    submitLogin: "Se connecter",
    submitRegister: "Créer un compte",
    forgotPassword: "Mot de passe oublié ?",
    continueWith: "ou continuer avec",
  },
  ta: {
    loginTitle: "உள்நுழைவு",
    registerTitle: "கணக்கு உருவாக்கு",
    loginSubtitle: "சில வினாடிகளில் உங்கள் கணக்கில் நுழையுங்கள்",
    registerSubtitle: "உங்கள் கணக்கை உருவாக்கி உடனே கற்றலை தொடங்குங்கள்",
    loginTab: "உள்நுழை",
    registerTab: "கணக்கு உருவாக்கு",
    fullName: "முழுப்பெயர்",
    fullNamePlaceholder: "உங்கள் முழுப்பெயர்",
    email: "மின்னஞ்சல்",
    emailPlaceholder: "example@email.com",
    password: "கடவுச்சொல்",
    passwordChoose: "கடவுச்சொல்லை தேர்வு செய்யவும்",
    passwordPlaceholder: "........",
    confirmPassword: "கடவுச்சொல்லை உறுதிப்படுத்தவும்",
    submitLogin: "உள்நுழை",
    submitRegister: "கணக்கு உருவாக்கு",
    forgotPassword: "கடவுச்சொல் மறந்துவிட்டதா?",
    continueWith: "அல்லது தொடரவும்",
  },
};

export function AuthForm({
  mode,
  locale,
}: {
  mode: "login" | "register";
  locale: Locale;
}) {
  const [state, formAction, pending] = useActionState(
    mode === "login" ? loginAction : registerAction,
    initialAuthState,
  );

  const isLogin = mode === "login";
  const copy = authCopy[locale];

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-[120rem] items-center px-4 py-6 sm:px-6 xl:px-8">
      <div className="mx-auto w-full max-w-3xl rounded-[1.75rem] border border-[rgba(185,121,63,0.22)] bg-[#fff8ec]/95 px-6 py-7 shadow-[0_20px_60px_-40px_rgba(74,51,36,0.36)] sm:px-8 sm:py-8">
        <div>
          <h1 className="text-4xl font-black tracking-[-0.05em] text-[var(--brand-ink)] sm:text-[3.1rem]">
            {isLogin ? copy.loginTitle : copy.registerTitle}
          </h1>
          <p className="mt-2 text-base text-[#6f553d] sm:text-lg">
            {isLogin ? copy.loginSubtitle : copy.registerSubtitle}
          </p>
        </div>

        <div className="mt-6 rounded-[1rem] border border-[rgba(185,121,63,0.18)] bg-[#f4dfb6]/45 p-2">
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/${locale}/auth/login`}
              className={`rounded-[0.8rem] px-5 py-3.5 text-center text-base transition sm:text-lg ${
                isLogin ? "bg-[#fff8ec] text-[var(--brand-ink)] shadow-sm" : "text-[#8a6a4c] hover:text-[var(--brand-ink)]"
              }`}
            >
              {copy.loginTab}
            </Link>
            <Link
              href={`/${locale}/auth/register`}
              className={`rounded-[0.8rem] px-5 py-3.5 text-center text-base transition sm:text-lg ${
                !isLogin ? "bg-[#fff8ec] text-[var(--brand-ink)] shadow-sm" : "text-[#8a6a4c] hover:text-[var(--brand-ink)]"
              }`}
            >
              {copy.registerTab}
            </Link>
          </div>
        </div>

        <form className="mt-7 space-y-4 sm:space-y-5" action={formAction}>
          <input type="hidden" name="locale" value={locale} />

          {isLogin ? null : (
            <label className="block">
              <span className="mb-2.5 block text-lg text-[#654632] sm:text-xl">{copy.fullName}</span>
              <input
                name="fullName"
                className="w-full rounded-[1rem] border border-[rgba(185,121,63,0.24)] bg-[#fffdf8] px-5 py-4 text-lg text-[#2a1a11] outline-none transition placeholder:text-[#b49a7c] focus:border-[#b9793f] focus:ring-4 focus:ring-[#f4dfb6] sm:px-6 sm:py-4.5 sm:text-xl"
                placeholder={copy.fullNamePlaceholder}
                required
              />
            </label>
          )}

          <label className="block">
            <span className="mb-2.5 block text-lg text-[#654632] sm:text-xl">{copy.email}</span>
            <input
              type="email"
              name="email"
              className="w-full rounded-[1rem] border border-[rgba(185,121,63,0.24)] bg-[#fffdf8] px-5 py-4 text-lg text-[#2a1a11] outline-none transition placeholder:text-[#b49a7c] focus:border-[#b9793f] focus:ring-4 focus:ring-[#f4dfb6] sm:px-6 sm:py-4.5 sm:text-xl"
              placeholder={copy.emailPlaceholder}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2.5 block text-lg text-[#654632] sm:text-xl">
              {isLogin ? copy.password : copy.passwordChoose}
            </span>
            <input
              type="password"
              name="password"
              className="w-full rounded-[1rem] border border-[rgba(185,121,63,0.24)] bg-[#fffdf8] px-5 py-4 text-lg text-[#2a1a11] outline-none transition placeholder:text-[#b49a7c] focus:border-[#b9793f] focus:ring-4 focus:ring-[#f4dfb6] sm:px-6 sm:py-4.5 sm:text-xl"
              placeholder={copy.passwordPlaceholder}
              required
            />
          </label>

          {!isLogin ? (
            <label className="block">
              <span className="mb-2.5 block text-lg text-[#654632] sm:text-xl">{copy.confirmPassword}</span>
              <input
                type="password"
                name="confirmPassword"
                className="w-full rounded-[1rem] border border-[rgba(185,121,63,0.24)] bg-[#fffdf8] px-5 py-4 text-lg text-[#2a1a11] outline-none transition placeholder:text-[#b49a7c] focus:border-[#b9793f] focus:ring-4 focus:ring-[#f4dfb6] sm:px-6 sm:py-4.5 sm:text-xl"
                placeholder={copy.passwordPlaceholder}
                required
              />
            </label>
          ) : null}

          <button
            className="w-full rounded-[1rem] bg-[#8a5a2e] px-6 py-4 text-lg font-semibold text-[#fff2dd] transition hover:translate-y-[-1px] hover:bg-[#654632] disabled:opacity-60 sm:py-4.5 sm:text-xl"
            disabled={pending}
          >
            {isLogin ? copy.submitLogin : copy.submitRegister}
          </button>

          {isLogin ? (
            <div className="flex justify-end">
              <span className="text-base text-[#8a5a2e] sm:text-lg">{copy.forgotPassword}</span>
            </div>
          ) : null}

          {state.message ? (
            <p className={`text-base ${state.ok ? "text-emerald-700" : "text-rose-600"}`}>{state.message}</p>
          ) : null}

          <div className="flex items-center gap-4 pt-1 text-base text-[#8a6a4c] sm:gap-6 sm:text-lg">
            <span className="h-px flex-1 bg-[rgba(185,121,63,0.2)]" />
            <span>{copy.continueWith}</span>
            <span className="h-px flex-1 bg-[rgba(185,121,63,0.2)]" />
          </div>

          <button
            type="button"
            disabled
            className="mx-auto flex w-full max-w-3xl items-center justify-center gap-4 rounded-[1rem] border border-[rgba(185,121,63,0.24)] bg-[#fffdf8] px-6 py-4 text-lg text-[#654632] opacity-70 sm:text-xl"
          >
            <span className="text-3xl font-black text-[#4285F4]">G</span>
            <span>Google</span>
          </button>
        </form>
      </div>
    </div>
  );
}
