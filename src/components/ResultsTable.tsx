import { useNavigate } from "react-router-dom";
import { fmtNumber, isFiniteNumber } from "../lib/format";
import type { ExoplanetRow } from "../lib/types";

type Props = { rows: ExoplanetRow[] };

export default function ResultsTable({ rows }: Props) {
  const nav = useNavigate();
  const list = rows.slice(0, 50);

  const badge = (label: ExoplanetRow["classification"]) => {
    const base = "px-2 py-1 rounded-full text-xs font-semibold";
    if (label === "Confirmado")
      return <span className={`${base} bg-emerald-500/15 text-emerald-300 border border-emerald-400/30`}>Confirmado</span>;
    if (label === "Candidato")
      return <span className={`${base} bg-cyan-500/15 text-cyan-300 border border-cyan-400/30`}>Candidato</span>;
    if (label === "Falso positivo")
      return <span className={`${base} bg-rose-500/15 text-rose-300 border border-rose-400/30`}>Falso positivo</span>;
    return <span className={`${base} bg-slate-500/10 text-slate-300 border border-slate-400/20`}>{label}</span>;
  };

  const fmtScore = (score?: number) => {
    if (!isFiniteNumber(score)) return "—";
    const pct = score <= 1 ? Math.round(score * 100) : Math.round(score);
    return `${pct}%`;
  };

  return (
    <div className="panel p-4 md:p-6 overflow-x-auto">
      <h3 className="font-semibold mb-3">Tabla de resultados (primeros 50)</h3>
      <table className="min-w-full text-sm">
        <thead className="text-slate-300">
          <tr>
            <th className="text-left py-2 pr-4">ID</th>
            <th className="text-left py-2 pr-4">Período (d)</th>
            <th className="text-left py-2 pr-4">Radio (R⊕)</th>
            <th className="text-left py-2 pr-4">Clasificación</th>
            <th className="text-left py-2 pr-4">Confianza</th>
            <th />
          </tr>
        </thead>
        <tbody className="text-slate-200/90">
          {list.map((r) => (
            <tr key={r.id} className="border-t border-white/5">
              <td className="py-3 pr-4">{r.id}</td>
              <td className="py-3 pr-4">{fmtNumber((r as any).period ?? (r as any).koi_period, 2)}</td>
              <td className="py-3 pr-4">{fmtNumber((r as any).radius ?? (r as any).koi_prad, 2)}</td>
              <td className="py-3 pr-4">{badge(r.classification)}</td>
              <td className="py-3 pr-4">{fmtScore((r as any).score ?? (r as any).koi_score)}</td>
              <td className="py-3 pr-0">
                <button
                  className="px-3 py-1.5 rounded-lg border border-cyan-400/30 text-cyan-200 hover:bg-cyan-500/10"
                  onClick={() => nav(`/planet/${encodeURIComponent(r.id.trim())}`)}
                >
                  Ver detalles
                </button>
              </td>
            </tr>
          ))}
          {!list.length && (
            <tr><td colSpan={6} className="py-6 text-center text-slate-400">Sin datos.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
