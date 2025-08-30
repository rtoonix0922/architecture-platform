export default function StatusBadge({ status }: { status: string }) {
  const m: Record<string, string> = {
    planned: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    "in-progress": "bg-amber-100 text-amber-900 ring-1 ring-amber-200",
    completed: "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m[status] ?? m.planned}`}>
      {status}
    </span>
  );
}
