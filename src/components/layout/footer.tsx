import { BrandMark } from "./brand-mark";

export function Footer() {
  return (
    <footer className="mt-14 border-t border-[rgba(185,121,63,0.2)] bg-[#3a271b]/95 px-4 py-8 text-[#fff2dd] backdrop-blur sm:px-6">
      <div className="mx-auto grid max-w-[120rem] gap-8 lg:grid-cols-[1.05fr_0.95fr] xl:px-2">
        <div>
          <BrandMark />
          <h2 className="mt-5 max-w-2xl font-display text-3xl leading-tight text-[#fff2dd]">
            Learn Tamil through clean, focused and interactive practice.
          </h2>
        </div>

        <div className="grid gap-4 text-sm leading-7 text-[#ead2ae] sm:grid-cols-2">
          <p>
            Kalvikoodam is built as a structured Tamil learning workspace with guided games,
            access control and progress-aware flows.
          </p>
          <p>
            The platform stays explorable with demo-friendly fallbacks while live data and
            subscriptions are being configured.
          </p>
        </div>
      </div>
    </footer>
  );
}
