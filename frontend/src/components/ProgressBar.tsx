export default function ProgressBar({ value, max=100 }: { value: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / Math.max(1, max)) * 100)));
  return (
    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
      <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
    </div>
  );
}
