"use client";

import Image from "next/image";
import { useState } from "react";

import type { SplashSlide } from "@/types";

const QUOTE = "கற்றதனால் ஆய பயனென்கொல் வாலறிவன்\nநற்றாள் தொழாஅர் எனின்";
const TAMIL_NUMERALS = ["௦", "௧", "௨", "௩", "௪", "௫", "௬", "௭", "௮", "௯"];

function formatTamilNumber(value: number) {
  return String(value)
    .split("")
    .map((digit) => TAMIL_NUMERALS[Number(digit)] ?? digit)
    .join("");
}

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
  const currentStep = screenIndex + 1;
  const totalSteps = slides.length;
  const tallyLabel = `${formatTamilNumber(currentStep)} / ${formatTamilNumber(totalSteps)}`;

  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto overflow-x-hidden bg-[#4a3324] text-[#fff2dd]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_900px_500px_at_50%_-10%,rgba(255,222,145,0.24),transparent_64%),radial-gradient(ellipse_700px_600px_at_100%_100%,rgba(211,146,82,0.22),transparent_64%),linear-gradient(180deg,#5a3d2a_0%,#493122_52%,#3a271b_100%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.025] mix-blend-overlay [background-image:repeating-linear-gradient(90deg,rgba(255,242,221,0.45)_0px,transparent_1px,transparent_3px),repeating-linear-gradient(0deg,rgba(255,242,221,0.45)_0px,transparent_1px,transparent_3px)] [background-size:3px_3px]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[560px] flex-col px-4 pb-24 pt-6 sm:justify-center sm:px-6 sm:py-10">
        <div className="mb-5 flex items-center justify-between sm:mb-7">
          <div className="flex items-center gap-1.5">
            {slides.map((slide, index) => (
              <span
                key={slide.id}
                className={`h-[7px] w-4 rounded-[0_60%_0_60%] border transition sm:h-[9px] sm:w-5 ${
                  index <= screenIndex
                    ? "border-[#d3a238] bg-[linear-gradient(135deg,#e8c876,#b9793f)] shadow-[0_0_8px_rgba(211,162,56,0.35)]"
                    : "border-[rgba(232,200,118,0.38)] bg-[#654632]"
                }`}
              />
            ))}
            <span className="ml-1.5 font-serif text-[11px] italic tracking-[0.02em] text-[#ead2ae] sm:ml-2 sm:text-[13px]">
              {tallyLabel}
            </span>
          </div>

          <button
            type="button"
            onClick={closeSplash}
            className="border border-[rgba(232,200,118,0.38)] bg-[rgba(255,242,221,0.03)] px-3.5 py-1.5 font-serif text-[11px] uppercase tracking-[0.12em] text-[#ead2ae] transition hover:border-[#e8c876] hover:bg-[rgba(255,222,145,0.08)] hover:text-[#fff2dd] sm:px-[18px] sm:py-[7px] sm:text-[13px] sm:tracking-[0.16em]"
          >
            Skip
          </button>
        </div>

        {isIntroScreen ? (
          <>
            <div className="text-center">
              <p className="mb-2.5 font-serif text-[10px] uppercase tracking-[0.35em] text-[#b9793f] sm:text-xs sm:tracking-[0.5em]">
                Kalvikoodam
              </p>
              <h1 className="bg-[linear-gradient(180deg,#e8c876_10%,#b9793f_90%)] bg-clip-text text-[clamp(30px,9.5vw,54px)] font-semibold leading-[1.15] text-transparent drop-shadow-[0_2px_14px_rgba(211,162,56,0.18)]">
                கல்விக்கூடம்
              </h1>
              <p className="mt-2 text-[13px] tracking-[0.02em] text-[#ead2ae] sm:text-sm">தமிழ் அறிவின் தொடக்கம்</p>
            </div>

            <div className="mx-auto my-5 flex w-40 items-center justify-center gap-2.5 sm:my-6 sm:w-[220px]">
              <span className="h-px flex-1 bg-[linear-gradient(90deg,transparent,#b9793f)]" />
              <span className="h-2 w-2 rotate-45 border border-[#d3a238] bg-[#4a3324]" />
              <span className="h-px flex-1 bg-[linear-gradient(90deg,#b9793f,transparent)]" />
            </div>

            <div className="relative p-2.5 sm:p-3.5">
              <div className="pointer-events-none absolute inset-0 border border-[rgba(211,162,56,0.28)]" />
              <span className="absolute left-0.5 top-0.5 h-[18px] w-[18px] border-l-2 border-t-2 border-[#d3a238] sm:h-[26px] sm:w-[26px]" />
              <span className="absolute right-0.5 top-0.5 h-[18px] w-[18px] border-r-2 border-t-2 border-[#d3a238] sm:h-[26px] sm:w-[26px]" />
              <span className="absolute bottom-0.5 left-0.5 h-[18px] w-[18px] border-b-2 border-l-2 border-[#d3a238] sm:h-[26px] sm:w-[26px]" />
              <span className="absolute bottom-0.5 right-0.5 h-[18px] w-[18px] border-b-2 border-r-2 border-[#d3a238] sm:h-[26px] sm:w-[26px]" />

              <div className="relative overflow-hidden rounded-sm bg-[#654632] shadow-[0_30px_60px_-28px_rgba(0,0,0,0.5),0_0_0_1px_rgba(232,200,118,0.22)]">
                {imageReady ? (
                  <Image
                    src={currentSlide.imageUrl}
                    alt="திருவள்ளுவர்"
                    width={1123}
                    height={1684}
                    priority
                    unoptimized
                    className="block h-auto max-h-[58vh] w-full object-contain [filter:saturate(1.03)_contrast(1.02)] sm:max-h-[55vh]"
                    onError={() => setImageReady(false)}
                  />
                ) : (
                  <div className="flex aspect-[2/3] items-center justify-center px-8 text-center">
                    <p className="text-[1.05rem] leading-8 text-[#f1e6d3]">
                      Ajoute l&apos;image ici:
                      <br />
                      <span className="font-medium text-[#e8c876]">{currentSlide.imageUrl}</span>
                    </p>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(74,51,36,0)_62%,rgba(74,51,36,0.24)_100%)]" />
                <span className="absolute bottom-2.5 left-2.5 z-10 font-serif text-xs italic tracking-[0.04em] text-[#e8c876] sm:bottom-3.5 sm:left-3.5 sm:text-[13px]">
                  திருவள்ளுவர்
                </span>
              </div>
            </div>

            <div className="relative mt-5 border border-[rgba(232,200,118,0.38)] bg-[linear-gradient(160deg,rgba(255,222,145,0.16),rgba(255,255,255,0.04)_52%),#654632] px-[18px] py-5 text-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),0_20px_40px_-28px_rgba(0,0,0,0.42)] sm:mt-6 sm:px-[30px] sm:py-[26px]">
              <span className="absolute -left-[5px] -top-[5px] h-2.5 w-2.5 rounded-full bg-[#d3a238] shadow-[0_0_10px_rgba(211,162,56,0.5)]" />
              <span className="absolute -right-[5px] -top-[5px] h-2.5 w-2.5 rounded-full bg-[#d3a238] shadow-[0_0_10px_rgba(211,162,56,0.5)]" />
              <p className="whitespace-pre-line text-[16px] font-semibold leading-[1.75] tracking-[0.01em] text-[#fff2dd] sm:text-[19px] sm:leading-[1.85]">
                {QUOTE}
              </p>
              <p className="mt-2.5 font-serif text-[11px] italic uppercase tracking-[0.14em] text-[#b9793f] sm:mt-3.5 sm:text-xs">
                திருக்குறள் · அதிகாரம் 2
              </p>
            </div>
          </>
        ) : (
          <div className="relative min-h-[calc(100vh-10rem)] overflow-hidden rounded-sm border border-[rgba(232,200,118,0.38)] bg-[#654632] shadow-[0_30px_60px_-28px_rgba(0,0,0,0.5)]">
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
              <div className="flex min-h-[calc(100vh-10rem)] w-full items-center justify-center px-8 text-center">
                <p className="text-[1.05rem] leading-8 text-[#f1e6d3] sm:text-[1.2rem]">
                  Ajoute l&apos;image ici:
                  <br />
                  <span className="font-medium text-[#e8c876]">{currentSlide.imageUrl}</span>
                </p>
              </div>
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(74,51,36,0.01),rgba(74,51,36,0.12))]" />
          </div>
        )}

        {screenIndex > 0 ? (
          <div className="pointer-events-none fixed bottom-5 left-5 z-20 sm:bottom-auto sm:left-9 sm:top-1/2 sm:-translate-y-1/2">
            <button
              type="button"
              onClick={goToPreviousScreen}
              aria-label="Écran précédent"
              className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(232,200,118,0.42)] bg-[rgba(101,70,50,0.78)] p-0 text-[#ffe19c] shadow-[0_18px_50px_-30px_rgba(0,0,0,0.52)] backdrop-blur-md transition hover:scale-105 hover:border-[#e8c876] hover:shadow-[0_0_22px_rgba(211,162,56,0.25)] sm:h-[52px] sm:w-[52px]"
            >
              <SplashChevronIcon direction="previous" />
            </button>
          </div>
        ) : null}

        <div className="pointer-events-none fixed bottom-5 right-5 z-20 sm:bottom-auto sm:right-9 sm:top-1/2 sm:-translate-y-1/2">
          {screenIndex < totalSteps - 1 ? (
            <button
              type="button"
              onClick={goToNextScreen}
              aria-label="Écran suivant"
              className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(232,200,118,0.42)] bg-[rgba(101,70,50,0.78)] p-0 text-[#ffe19c] shadow-[0_18px_50px_-30px_rgba(0,0,0,0.52)] backdrop-blur-md transition hover:scale-105 hover:border-[#e8c876] hover:shadow-[0_0_22px_rgba(211,162,56,0.25)] sm:h-[52px] sm:w-[52px]"
            >
              <SplashChevronIcon direction="next" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
