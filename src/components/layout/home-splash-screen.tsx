"use client";

import Image from "next/image";
import { useState } from "react";

import type { SplashSlide } from "@/types";

const QUOTE = "கற்றதனால் ஆய பயனென்கொல் வாலறிவன்\nநற்றாள் தொழாஅர் எனின்";

export function HomeSplashScreen({
  slides,
}: {
  slides: SplashSlide[];
}) {
  const [visible, setVisible] = useState(true);
  const [screenIndex, setScreenIndex] = useState(0);
  const [imageReady, setImageReady] = useState(true);

  const closeSplash = () => {
    setVisible(false);
  };

  const goToPreviousScreen = () => {
    setImageReady(true);
    setScreenIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNextScreen = () => {
    setImageReady(true);
    setScreenIndex((prev) => Math.min(slides.length - 1, prev + 1));
  };

  if (!visible || slides.length === 0) {
    return null;
  }

  const currentSlide = slides[screenIndex];
  const isIntroScreen = currentSlide.kind === "intro";
  const currentStep = screenIndex + 1;
  const totalSteps = slides.length;

  return (
    <div className="fixed inset-0 z-[120] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(122,88,45,0.18),transparent_28%),linear-gradient(180deg,#15110d_0%,#201810_42%,#120e0b_100%)]">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(205,164,94,0.05),transparent_18%,transparent_82%,rgba(205,164,94,0.05))]" />

      <div className="relative flex min-h-screen flex-col">
        <button
          type="button"
          onClick={closeSplash}
          className="absolute right-5 top-5 z-20 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-white transition hover:bg-white/20 sm:right-8 sm:top-8"
        >
          Skip
        </button>

        <div className="absolute left-5 top-5 z-20 rounded-full border border-[#d6b06a]/20 bg-white/[0.04] px-4 py-2 text-[0.72rem] uppercase tracking-[0.24em] text-[#d9bb7c] sm:left-8 sm:top-8">
          {currentStep} / {totalSteps}
        </div>

        {isIntroScreen ? (
          <div className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 sm:py-10">
            <div className="mx-auto flex w-full max-w-[32rem] flex-col items-center justify-center">
              <div className="mb-5 flex w-full flex-col items-center text-center">
                <p className="text-[0.78rem] uppercase tracking-[0.42em] text-[#d6ae63] drop-shadow-[0_3px_12px_rgba(0,0,0,0.6)] sm:text-[0.92rem]">
                  Kalvikoodam
                </p>
                <h1 className="mt-2 bg-[linear-gradient(180deg,#fff6dc_0%,#f3d28a_32%,#d29a3b_62%,#fff0c8_100%)] bg-clip-text text-[3.2rem] font-semibold leading-[0.92] tracking-[0.015em] text-transparent drop-shadow-[0_6px_0_rgba(111,72,21,0.72)] [text-shadow:0_2px_0_rgba(255,247,220,0.45),0_14px_28px_rgba(0,0,0,0.42)] sm:text-[4.7rem]">
                  கல்விக்கூடம்
                </h1>
                <div className="mt-3 flex w-full max-w-[23rem] items-center gap-3 sm:max-w-[28rem]">
                  <span className="h-px flex-1 bg-[linear-gradient(90deg,transparent,#d7aa59_45%,#f1d69d_100%)]" />
                  <span className="text-[1.1rem] text-[#d6ae63] drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)] sm:text-[1.25rem]">
                    ✦
                  </span>
                  <span className="h-px flex-1 bg-[linear-gradient(90deg,#f1d69d_0%,#d7aa59_55%,transparent)]" />
                </div>
              </div>

              <div className="max-w-full overflow-hidden rounded-[1.8rem] border-2 border-[#d8b067] bg-transparent leading-none shadow-[0_30px_90px_-40px_rgba(0,0,0,0.72)]">
                {imageReady ? (
                  <div className="block max-w-full overflow-hidden rounded-[1.8rem] bg-transparent leading-none">
                    <Image
                      src={currentSlide.imageUrl}
                      alt="Thiruvalluvar"
                      width={1123}
                      height={1684}
                      priority
                      unoptimized
                      className="block h-auto max-h-[62vh] w-auto max-w-full object-contain"
                      onError={() => setImageReady(false)}
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[2/3] items-center justify-center bg-[radial-gradient(circle_at_top,#6b4c2d_0%,#311f13_55%,#1a120c_100%)] px-8 text-center">
                    <p className="text-[1.05rem] leading-8 text-[#f1dec0] sm:text-[1.15rem]">
                      Ajoute l&apos;image ici:
                      <br />
                      <span className="font-medium text-[#ffd898]">{currentSlide.imageUrl}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-5 w-full rounded-[1.45rem] border border-[#d6b06a]/22 bg-white/[0.04] px-5 py-5 text-center shadow-[0_24px_80px_-45px_rgba(0,0,0,0.65)]">
                <p className="whitespace-pre-line text-[1.02rem] font-medium leading-[2.05] tracking-[0.01em] text-[#e6ba68] sm:text-[1.2rem]">
                  {QUOTE}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex min-h-screen items-center justify-center overflow-hidden">
            {imageReady ? (
              <Image
                src={currentSlide.imageUrl}
                alt={`Splash screen ${screenIndex}`}
                fill
                priority
                unoptimized
                className="object-cover"
                onError={() => setImageReady(false)}
              />
            ) : (
              <div className="flex min-h-screen w-full items-center justify-center bg-[radial-gradient(circle_at_top,#6b4c2d_0%,#311f13_55%,#1a120c_100%)] px-8 text-center">
                <p className="text-[1.05rem] leading-8 text-[#f1dec0] sm:text-[1.2rem]">
                  Ajoute l&apos;image ici:
                  <br />
                  <span className="font-medium text-[#ffd898]">{currentSlide.imageUrl}</span>
                </p>
              </div>
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,10,6,0.18),rgba(15,10,6,0.34))]" />
          </div>
        )}

        {screenIndex > 0 ? (
          <div className="pointer-events-none absolute left-6 top-1/2 z-20 -translate-y-1/2 sm:left-8">
            <button
              type="button"
              onClick={goToPreviousScreen}
              aria-label="Écran précédent"
              className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#d6b06a]/28 bg-[rgba(255,255,255,0.08)] text-3xl text-[#f0cf90] shadow-[0_18px_50px_-28px_rgba(0,0,0,0.75)] transition hover:bg-[rgba(255,255,255,0.14)]"
            >
              ‹
            </button>
          </div>
        ) : null}

        <div className="pointer-events-none absolute right-6 top-1/2 z-20 -translate-y-1/2 sm:right-8">
          {screenIndex < totalSteps - 1 ? (
            <button
              type="button"
              onClick={goToNextScreen}
              aria-label="Écran suivant"
              className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#d6b06a]/32 bg-[rgba(255,255,255,0.08)] text-4xl text-[#f0cf90] shadow-[0_18px_50px_-28px_rgba(0,0,0,0.75)] transition hover:bg-[rgba(255,255,255,0.14)]"
            >
              ›
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
