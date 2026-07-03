import { appName } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function BrandMark({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  if (compact) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full border-[3px] border-[#180d2b] bg-white px-2.5 py-1.5 pr-4 shadow-[5px_6px_0_#180d2b] transition hover:-translate-y-0.5",
          className,
        )}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] border-[#180d2b] bg-[#ffc43d] font-tamil text-2xl font-black leading-none text-[#180d2b]">
          அ
        </span>
        <span className="font-display text-[1.45rem] font-black leading-none text-[#180d2b]">
          {appName}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <svg
        viewBox="0 0 120 120"
        aria-hidden="true"
        className="h-20 w-20 shrink-0"
      >
        <defs>
          <linearGradient id="brandSun" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8c876" />
            <stop offset="100%" stopColor="#b9793f" />
          </linearGradient>
          <linearGradient id="brandBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3a271b" />
            <stop offset="100%" stopColor="#8a5a2e" />
          </linearGradient>
          <linearGradient id="brandFlame" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff2bd" />
            <stop offset="100%" stopColor="#b9793f" />
          </linearGradient>
        </defs>

        <path
          d="M24 56a36 36 0 0 1 72 0"
          fill="none"
          stroke="url(#brandSun)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <g stroke="url(#brandSun)" strokeWidth="5" strokeLinecap="round">
          <path d="M60 12v12" />
          <path d="M28 24l7 10" />
          <path d="M92 24l-7 10" />
          <path d="M14 50l12 2" />
          <path d="M106 50l-12 2" />
        </g>

        <text
          x="60"
          y="62"
          textAnchor="middle"
          fontSize="54"
          fontWeight="700"
          fill="url(#brandBlue)"
          style={{ fontFamily: '"Noto Sans Tamil", "Nirmala UI", sans-serif' }}
        >
          க
        </text>

        <path d="M16 92c11-14 24-22 38-24-2 10-10 20-20 28-7-1-12-2-18-4Z" fill="#fff2dd" />
        <path d="M104 92c-11-14-24-22-38-24 2 10 10 20 20 28 7-1 12-2 18-4Z" fill="#fff2dd" />
        <path d="M12 95c14-2 28 1 42 9-13 3-28 3-42-1Z" fill="url(#brandBlue)" />
        <path d="M108 95c-14-2-28 1-42 9 13 3 28 3 42-1Z" fill="url(#brandBlue)" />
        <ellipse cx="60" cy="96" rx="15" ry="6" fill="#654632" />
        <path d="M60 72c7 9 9 17 0 28-9-11-7-19 0-28Z" fill="url(#brandFlame)" />
        <path d="M60 79c4 5 5 10 0 17-5-7-4-12 0-17Z" fill="#fff3b0" />
      </svg>

      <div className="min-w-0">
        <div
          className={cn(
            "font-display leading-none bg-[linear-gradient(180deg,#5a3d2a,#2a1a11)] bg-clip-text text-transparent",
            "text-[2.7rem] font-semibold tracking-[-0.04em]",
          )}
        >
          {appName}
        </div>

        <div className="mt-2 flex items-center gap-3">
          <span className="h-px w-10 bg-[#b9793f]" />
          <div className="font-tamil text-[1.2rem] font-medium tracking-[0.02em] text-[#8a5a2e]">
            கல்விக்கூடம்
          </div>
          <span className="h-px w-10 bg-[#b9793f]" />
        </div>
      </div>
    </div>
  );
}
