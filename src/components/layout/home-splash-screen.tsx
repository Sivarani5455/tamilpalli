"use client";

import Image from "next/image";
import { useState } from "react";

import type { SplashSlide } from "@/types";

const QUOTE = "கற்றதனால் ஆய பயனென்கொல் வாலறிவன்\nநற்றாள் தொழாஅர் எனின்";

function SplashChevronIcon({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="block h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {direction === "previous" ? <path d="m15 18-6-6 6-6" /> : <path d="m9 6 6 6-6 6" />}
    </svg>
  );
}

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
  const totalSteps = slides.length;

  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto overflow-x-hidden bg-[#fff7ea] text-[#180d2b]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_10%_12%,rgba(198,255,46,0.12),transparent_22%),radial-gradient(circle_at_90%_16%,rgba(255,59,111,0.1),transparent_20%),linear-gradient(180deg,#fff7ea_0%,#fdf1df_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[640px] flex-col px-4 pb-24 pt-4 sm:justify-center sm:px-6 sm:py-8">
        {!isIntroScreen ? (
          <div className="mb-4 flex items-center justify-end sm:mb-5">
            <button
              type="button"
              onClick={closeSplash}
              className="rounded-full border-[2px] border-[#180d2b] bg-white px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-[#180d2b] shadow-[2px_3px_0_#180d2b] transition hover:-translate-y-0.5"
            >
              Skip
            </button>
          </div>
        ) : null}

        {isIntroScreen ? (
          <>
            <div className="text-center">
              <h1 className="font-tamil text-[clamp(38px,10vw,66px)] font-black leading-[1.05] tracking-[-0.04em] text-[#180d2b]">
                கல்<span className="text-[#ff3b6f]">வி</span>க்கூடம்
              </h1>
              <p className="mt-2 text-[13px] font-semibold tracking-[0.02em] text-[#8a6a9c] sm:text-sm">தமிழ் அறிவின் தொடக்கம்</p>
            </div>

            <div className="mx-auto my-4 flex w-40 items-center justify-center gap-2.5 sm:w-[220px]">
              <span className="h-[2px] flex-1 bg-[#b49ac6]" />
              <span className="h-3 w-3 rotate-45 border-[2px] border-[#180d2b] bg-[#ffc43d]" />
              <span className="h-[2px] flex-1 bg-[#b49ac6]" />
            </div>

            <div className="mx-auto mb-3 flex w-full max-w-[470px] justify-start">
              <button
                type="button"
                onClick={closeSplash}
                className="rounded-full border-[2px] border-[#180d2b] bg-white px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-[#180d2b] shadow-[2px_3px_0_#180d2b] transition hover:-translate-y-0.5"
              >
                Skip
              </button>
            </div>

            <div className="relative mx-auto w-full max-w-[470px]">
              <div className="relative aspect-[0.88] overflow-hidden rounded-[1.25rem] border-[3px] border-[#180d2b] bg-[linear-gradient(135deg,#7c3aed_0%,#c13ab6_44%,#ff3b6f_100%)] shadow-[8px_9px_0_#180d2b]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.22),transparent_24%),radial-gradient(circle_at_80%_78%,rgba(198,255,46,0.16),transparent_28%)]" />
                {imageReady ? (
                  <Image
                    src={currentSlide.imageUrl}
                    alt="திருவள்ளுவர்"
                    width={1123}
                    height={1684}
                    preload={screenIndex === 0}
                    sizes="(max-width: 640px) calc(100vw - 32px), 470px"
                    className="relative z-10 mx-auto h-full w-full object-contain p-7 [filter:saturate(1.08)_contrast(1.03)] sm:p-9"
                    onError={() => setImageReady(false)}
                  />
                ) : (
                  <div className="relative z-10 flex h-full items-center justify-center px-8 text-center">
                    <p className="text-[1.05rem] font-black leading-8 text-white">
                      Ajoute l&apos;image ici:
                      <br />
                      <span className="font-semibold text-[#c6ff2e]">{currentSlide.imageUrl}</span>
                    </p>
                  </div>
                )}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 120 120"
                  className="pointer-events-none absolute bottom-8 left-1/2 h-28 w-28 -translate-x-1/2 text-white/85 sm:h-36 sm:w-36"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="6"
                >
                  <path d="M58 86V38c-12-8-28-8-40 0v48c12-8 28-8 40 0Z" />
                  <path d="M62 86V38c12-8 28-8 40 0v48c-12-8-28-8-40 0Z" />
                </svg>
              </div>
              {screenIndex < totalSteps - 1 ? (
                <button
                  type="button"
                  onClick={goToNextScreen}
                  aria-label="Écran suivant"
                  className="absolute right-[-1.15rem] top-[42%] z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-[#180d2b] bg-[#ffc43d] p-0 text-[#180d2b] shadow-[4px_5px_0_#180d2b] transition hover:-translate-y-[55%] sm:right-[-1.35rem] sm:h-[52px] sm:w-[52px]"
                >
                  <SplashChevronIcon direction="next" />
                </button>
              ) : null}

              <div className="mt-5 rounded-[1.25rem] border-[3px] border-[#180d2b] bg-white px-[18px] py-5 text-center shadow-[6px_7px_0_#180d2b] sm:px-[30px] sm:py-[24px]">
                <p className="whitespace-pre-line font-tamil text-[16px] font-black leading-[1.75] tracking-[0.01em] text-[#180d2b] sm:text-[19px] sm:leading-[1.85]">
                  {QUOTE}
                </p>
                <p className="mt-2.5 text-[11px] font-black uppercase tracking-[0.14em] text-[#7c3aed] sm:mt-3.5 sm:text-xs">
                  திருக்குறள் · அதிகாரம் 2
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="relative min-h-[calc(100vh-10rem)] overflow-hidden rounded-[1.25rem] border-[3px] border-[#180d2b] bg-[#fff7ed] shadow-[8px_9px_0_#180d2b]">
            {imageReady ? (
              <Image
                src={currentSlide.imageUrl}
                alt={`Splash screen ${screenIndex}`}
                fill
                sizes="(max-width: 640px) calc(100vw - 32px), 640px"
                className="object-cover"
                onError={() => setImageReady(false)}
              />
            ) : (
              <div className="flex min-h-[calc(100vh-10rem)] w-full items-center justify-center px-8 text-center">
                <p className="text-[1.05rem] font-black leading-8 text-[#180d2b] sm:text-[1.2rem]">
                  Ajoute l&apos;image ici:
                  <br />
                  <span className="font-semibold text-[#7c3aed]">{currentSlide.imageUrl}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {screenIndex > 0 ? (
          <div className="pointer-events-none fixed bottom-5 left-5 z-20 sm:bottom-auto sm:left-9 sm:top-1/2 sm:-translate-y-1/2">
            <button
              type="button"
              onClick={goToPreviousScreen}
              aria-label="Écran précédent"
              className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-[#180d2b] bg-[#ffc43d] p-0 text-[#180d2b] shadow-[4px_5px_0_#180d2b] transition hover:-translate-y-0.5 sm:h-[52px] sm:w-[52px]"
            >
              <SplashChevronIcon direction="previous" />
            </button>
          </div>
        ) : null}

        {!isIntroScreen ? (
          <div className="pointer-events-none fixed bottom-5 right-5 z-20 sm:bottom-auto sm:right-9 sm:top-1/2 sm:-translate-y-1/2">
            {screenIndex < totalSteps - 1 ? (
              <button
                type="button"
                onClick={goToNextScreen}
                aria-label="Écran suivant"
                className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-[#180d2b] bg-[#ffc43d] p-0 text-[#180d2b] shadow-[4px_5px_0_#180d2b] transition hover:-translate-y-0.5 sm:h-[52px] sm:w-[52px]"
              >
                <SplashChevronIcon direction="next" />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
