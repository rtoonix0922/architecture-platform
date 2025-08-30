export default function EmptyState({ title, subtitle, cta }: { title: string; subtitle?: string; cta?: React.ReactNode }) {
  return (
    <div className="text-center py-10">
      <div className="text-lg font-semibold">{title}</div>
      {subtitle && <div className="text-sm text-slate-600 mt-1">{subtitle}</div>}
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  );
}
