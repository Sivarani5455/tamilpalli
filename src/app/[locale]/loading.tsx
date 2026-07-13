export default function LocaleLoading() {
  return (
    <div className="min-h-[calc(100dvh-72px)] bg-[#fff7ec] px-4 py-6 sm:min-h-[calc(100dvh-88px)] sm:px-6 sm:py-8" role="status" aria-label="Chargement">
      <div className="mx-auto max-w-5xl animate-pulse">
        <div className="h-4 w-28 rounded-full bg-[#d9cbed]" />
        <div className="mt-4 h-9 w-3/4 max-w-md rounded-xl bg-[#e8def2] sm:h-12" />
        <div className="mt-3 h-4 w-full max-w-xl rounded-full bg-[#eadfce]" />

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-36 rounded-[1.25rem] border-[3px] border-[#180d2b]/20 bg-white shadow-[4px_5px_0_rgba(24,13,43,0.12)] sm:h-44"
            />
          ))}
        </div>
      </div>
      <span className="sr-only">Chargement de la page…</span>
    </div>
  );
}
