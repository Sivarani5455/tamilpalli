export function CatalogShuffleButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#d8c7a9] bg-white text-[#55409a] transition-colors hover:border-[#55409a] hover:bg-[#f4efff] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:gap-1.5 sm:px-3"
      aria-label={label}
      title={label}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7h3c4 0 5 10 9 10h6" />
        <path d="m18 14 3 3-3 3" />
        <path d="M3 17h3c1.7 0 2.9-1.8 4-3.9" />
        <path d="M14 7h7" />
        <path d="m18 4 3 3-3 3" />
      </svg>
      <span className="hidden text-xs font-bold sm:inline">{label}</span>
    </button>
  );
}
