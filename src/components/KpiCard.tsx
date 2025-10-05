export function KpiCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[var(--card)] p-5">
      <div className="text-sm text-slate-300 mb-1">{label}</div>
      <div className="text-3xl font-extrabold">{value}</div>
    </div>
  );
}
