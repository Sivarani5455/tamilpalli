export function ScorePanel({
  title,
  score,
  helper,
}: {
  title: string;
  score: number;
  helper: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{score}</p>
      <p className="mt-2 text-sm text-slate-500">{helper}</p>
    </div>
  );
}
