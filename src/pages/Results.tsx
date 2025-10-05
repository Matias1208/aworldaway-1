import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ScatterChart, Scatter
} from "recharts";
import {
  Database, TrendingUp, CheckCircle, XCircle,
  AlertCircle, Download, Filter, Globe,
  BarChart3, Activity, ChevronDown
} from "lucide-react";

// --- Tipos y mock de datos (puedes reemplazar por tu store) ---
interface ExoplanetRow {
  id: string;
  classification: string;
  radius?: number;
  koi_prad?: number;
  period?: number;
  koi_period?: number;
  koi_score?: number;
  koi_model_snr?: number;
  koi_kepmag?: number;
  koi_teq?: number;
  confidence?: number;
}

const mockRows: ExoplanetRow[] = Array.from({ length: 100 }, (_, i) => {
  const score = Math.random();
  return {
    id: `KOI-${1000 + i}`,
    classification:
      score < 0.33 ? "Falso positivo" : score > 0.66 ? "Confirmado" : "Candidato",
    radius: Math.random() * 15 + 0.5,
    period: Math.random() * 500 + 0.5,
    koi_score: score,
    koi_model_snr: Math.random() * 50 + 5,
    koi_kepmag: Math.random() * 5 + 10,
    koi_teq: Math.random() * 2000 + 200,
    confidence: score,
  };
});

// --- Helpers ---
function isFiniteNumber(val: any): val is number {
  return typeof val === "number" && Number.isFinite(val);
}
const fmtNumber = (n?: number, d: number = 2) =>
  isFiniteNumber(n) ? n.toFixed(d) : "—";

// --- Tabla de Planet Details ---
function ResultsTable({ rows }: { rows: ExoplanetRow[] }) {
  const nav = useNavigate();
  const list = rows.slice(0, 50);

  const getPeriod = (r: ExoplanetRow) => r.period ?? r.koi_period;
  const getRadius = (r: ExoplanetRow) => r.radius ?? r.koi_prad;
  const getConf = (r: ExoplanetRow) => r.confidence ?? r.koi_score;

  const badge = (label: ExoplanetRow["classification"]) => {
    const base = "px-2 py-1 rounded-full text-xs font-semibold border";
    if (label === "Confirmado")
      return (
        <span className={`${base} bg-emerald-500/15 text-emerald-300 border-emerald-400/30`}>
          Confirmado
        </span>
      );
    if (label === "Candidato")
      return (
        <span className={`${base} bg-cyan-500/15 text-cyan-300 border-cyan-400/30`}>
          Candidato
        </span>
      );
    if (label === "Falso positivo")
      return (
        <span className={`${base} bg-rose-500/15 text-rose-300 border-rose-400/30`}>
          Falso positivo
        </span>
      );
    return (
      <span className={`${base} bg-slate-500/10 text-slate-300 border-slate-400/20`}>
        {label}
      </span>
    );
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 bg-opacity-20 flex items-center justify-center">
            <Database className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-semibold text-cyan-200">Tabla de resultados (primeros 50)</h3>
            <p className="text-slate-400 text-sm">Vista detallada por objeto</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 transition-all text-sm">
          <Filter className="w-4 h-4" />
          Filtrar
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-slate-300">
            <tr className="border-b border-white/10">
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
                <td className="py-3 pr-4">{fmtNumber(getPeriod(r), 2)}</td>
                <td className="py-3 pr-4">{fmtNumber(getRadius(r), 2)}</td>
                <td className="py-3 pr-4">{badge(r.classification)}</td>
                <td className="py-3 pr-4">
                  {isFiniteNumber(getConf(r))
                    ? `${Math.round(((getConf(r) as number) > 1 ? (getConf(r) as number) : (getConf(r) as number) * 100))}%`
                    : "—"}
                </td>
                <td className="py-3 pr-0">
                  <button
                    className="px-3 py-1.5 rounded-lg border border-cyan-400/30 text-cyan-200 hover:bg-cyan-500/10"
                    onClick={() =>
                      nav(`/planet/${encodeURIComponent(r.id.trim())}`)
                    }
                  >
                    Ver detalles
                  </button>
                </td>
              </tr>
            ))}
            {!list.length && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-400">
                  Sin datos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Página de Resultados ---
export default function Results() {
  // Sustituye mockRows por: const rows = useAppStore(s => s.data);
  const rows = mockRows;
  const nav = useNavigate();

  const [isExporting, setIsExporting] = useState(false);

  const stats = useMemo(() => {
    const total = rows.length;
    const c = rows.filter((r) => r.classification === "Candidato").length;
    const fp = rows.filter((r) => r.classification === "Falso positivo").length;
    const ok = rows.filter((r) => r.classification === "Confirmado").length;
    const avgConfidence =
      rows.reduce((sum, r) => sum + (r.confidence ?? r.koi_score ?? 0), 0) /
      (total || 1);
    return { total, c, fp, ok, avgConfidence };
  }, [rows]);

  const pieData = [
    { name: "Candidatos", value: stats.c, color: "#06b6d4" },
    { name: "Falsos Positivos", value: stats.fp, color: "#ef4444" },
    { name: "Confirmados", value: stats.ok, color: "#10b981" },
  ];

  const bins = useMemo(() => {
    const b = [
      { r: "0-2", n: 0, label: "Sub-Tierra" },
      { r: "2-4", n: 0, label: "Super-Tierra" },
      { r: "4-6", n: 0, label: "Mini-Neptuno" },
      { r: "6-8", n: 0, label: "Neptuno" },
      { r: "8-10", n: 0, label: "Sub-Júpiter" },
      { r: "10+", n: 0, label: "Júpiter+" },
    ];
    for (const x of rows) {
      const rv = x.radius ?? x.koi_prad;
      if (!isFiniteNumber(rv)) continue;
      if (rv < 2) b[0].n++;
      else if (rv < 4) b[1].n++;
      else if (rv < 6) b[2].n++;
      else if (rv < 8) b[3].n++;
      else if (rv < 10) b[4].n++;
      else b[5].n++;
    }
    return b;
  }, [rows]);

  const scatter = rows
    .map((r) => ({
      radius: r.radius ?? r.koi_prad,
      period: r.period ?? r.koi_period,
      classification: r.classification,
    }))
    .filter((p) => isFiniteNumber(p.radius) && isFiniteNumber(p.period));

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      console.log("Exportando datos...");
      setIsExporting(false);
    }, 1000);
  };

  const handleBack = () => {
    nav("/upload");
  };

  if (!rows.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 mx-auto rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700">
            <Database className="w-10 h-10 text-slate-400" />
          </div>
          <h1 className="text-3xl font-bold">No hay datos cargados</h1>
          <p className="text-slate-400">Carga un archivo CSV para comenzar el análisis</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-semibold hover:scale-105 transition-transform"
          >
            Ir a Carga
          </button>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      icon: Database,
      label: "Total objetos",
      value: stats.total,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-400/30",
    },
    {
      icon: AlertCircle,
      label: "Candidatos",
      value: stats.c,
      color: "from-cyan-500 to-teal-500",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-400/30",
    },
    {
      icon: CheckCircle,
      label: "Confirmados",
      value: stats.ok,
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-400/30",
    },
    {
      icon: XCircle,
      label: "Falsos positivos",
      value: stats.fp,
      color: "from-rose-500 to-red-500",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-400/30",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <button
              onClick={handleBack}
              className="text-cyan-300 hover:text-cyan-200 transition-colors flex items-center gap-2 group mb-4"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              Volver a carga
            </button>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Resultados del Análisis
            </h1>
            <p className="text-slate-400">
              Análisis completo de {stats.total} objetos detectados
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isExporting ? "Exportando..." : "Exportar"}
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiCards.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <div
                key={i}
                className={`relative group rounded-2xl border ${kpi.borderColor} ${kpi.bgColor} backdrop-blur-sm p-5 hover:scale-105 transition-all duration-300`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${kpi.color} bg-opacity-20 flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-400 text-sm">{kpi.label}</div>
                  <div className={`text-3xl font-bold bg-gradient-to-r ${kpi.color} bg-clip-text text-transparent`}>
                    {kpi.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Confidence Score */}
        <div className="rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 bg-opacity-20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-200">Confianza Promedio del Modelo</h3>
              <p className="text-slate-400 text-sm">Precisión general de las clasificaciones</p>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {(stats.avgConfidence * 100).toFixed(1)}%
            </span>
            <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                style={{ width: `${stats.avgConfidence * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pie */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:border-cyan-400/30 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 bg-opacity-20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold text-cyan-200">Distribución de Clasificaciones</h3>
                <p className="text-slate-400 text-sm">Proporción de cada categoría</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }: any) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
                  >
                    {pieData.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      borderRadius: "0.75rem",
                      color: "#e2e8f0",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Barras */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:border-blue-400/30 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 bg-opacity-20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-200">Distribución de Radios</h3>
                <p className="text-slate-400 text-sm">Clasificación por tamaño (R⊕)</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={bins}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="r" stroke="#cbd5e1" tick={{ fill: "#cbd5e1" }} />
                  <YAxis stroke="#cbd5e1" tick={{ fill: "#cbd5e1" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      borderRadius: "0.75rem",
                      color: "#e2e8f0",
                    }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data: any = payload[0].payload;
                        return (
                          <div className="bg-slate-900/95 border border-slate-700 rounded-xl p-3">
                            <p className="font-semibold text-blue-300">{data.label}</p>
                            <p className="text-slate-300">{data.r} R⊕</p>
                            <p className="text-white font-bold">{data.n} objetos</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="n" fill="#60a5fa" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Dispersión */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:border-purple-400/30 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 bg-opacity-20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-200">Radio vs Período Orbital</h3>
              <p className="text-slate-400 text-sm">Correlación entre tamaño y órbita</p>
            </div>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-300">Confirmados</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500" />
                <span className="text-slate-300">Candidatos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-slate-300">Falsos Pos.</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="radius"
                  name="Radio"
                  stroke="#cbd5e1"
                  tick={{ fill: "#cbd5e1" }}
                  label={{ value: "Radio (R⊕)", position: "insideBottom", offset: -5, fill: "#94a3b8" }}
                />
                <YAxis
                  dataKey="period"
                  name="Período"
                  stroke="#cbd5e1"
                  tick={{ fill: "#cbd5e1" }}
                  label={{ value: "Período (días)", angle: -90, position: "insideLeft", fill: "#94a3b8" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    borderRadius: "0.75rem",
                    color: "#e2e8f0",
                  }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data: any = payload[0].payload;
                      return (
                        <div className="bg-slate-900/95 border border-slate-700 rounded-xl p-3">
                          <p className="font-semibold text-purple-300">{data.classification}</p>
                          <p className="text-slate-300">Radio: {data.radius?.toFixed(2)} R⊕</p>
                          <p className="text-slate-300">Período: {data.period?.toFixed(2)} días</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter
                  data={scatter.filter((s) => s.classification === "Confirmado")}
                  fill="#10b981"
                  fillOpacity={0.7}
                />
                <Scatter
                  data={scatter.filter((s) => s.classification === "Candidato")}
                  fill="#06b6d4"
                  fillOpacity={0.7}
                />
                <Scatter
                  data={scatter.filter((s) => s.classification === "Falso positivo")}
                  fill="#ef4444"
                  fillOpacity={0.5}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabla de Planet Details */}
        <ResultsTable rows={rows} />
      </div>
    </div>
  );
}
