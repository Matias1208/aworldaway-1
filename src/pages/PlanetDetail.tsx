import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Globe, Calendar, Ruler, Activity, Star,
  TrendingUp, Thermometer, ArrowLeft, Download,
  CheckCircle, AlertCircle, XCircle, Info,
  Telescope, Orbit
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";

// Tipado local para evitar dependencias externas
type PlanetRow = {
  id: string;
  classification: string;
  period?: number;
  koi_period?: number;
  radius?: number;
  koi_prad?: number;
  koi_model_snr?: number;
  koi_kepmag?: number;
  koi_teq?: number;
  score?: number;
  koi_score?: number;
  confidence?: number;
};

function fmtNumber(val: any, decimals: number = 2): string {
  if (typeof val !== "number" || !Number.isFinite(val)) return "—";
  return val.toFixed(decimals);
}

export default function PlanetDetail() {
  const nav = useNavigate();
  const { id } = useParams();
  const rows = useAppStore((s) => s.data) as unknown as PlanetRow[];
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => setIsVisible(true), []);

  const decodedId = useMemo(
    () => decodeURIComponent((id ?? "").trim()),
    [id]
  );

  const row = useMemo(
    () => rows.find((r) => (r.id ?? "").trim() === decodedId),
    [rows, decodedId]
  );

  const handleBack = () => {
    nav("/results");
  };

  const handleExport = () => {
    // Aquí iría tu export real (CSV/JSON). Por ahora, simulamos.
    console.log("Exportando datos del planeta...", row);
  };

  // Sin datos globales: llevar al usuario a cargar
  if (!rows?.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white grid place-items-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 mx-auto rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700">
            <Globe className="w-10 h-10 text-slate-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">No hay datos cargados</h2>
            <p className="text-slate-400">Carga un archivo CSV para comenzar el análisis</p>
          </div>
          <button
            onClick={() => nav("/upload")}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-semibold hover:scale-105 transition-transform"
          >
            Ir a carga
          </button>
        </div>
      </div>
    );
  }

  // Hay datos pero no se encontró el ID
  if (!row) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white grid place-items-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 mx-auto rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700">
            <Globe className="w-10 h-10 text-slate-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Objeto no encontrado</h2>
            <p className="text-slate-400">
              No existe un planeta con ID <span className="text-slate-200 font-mono">{decodedId}</span>.
            </p>
          </div>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-semibold hover:scale-105 transition-transform"
          >
            Volver a resultados
          </button>
        </div>
      </div>
    );
  }

  // Derivados y métricas
  const period = row.period ?? row.koi_period;
  const radius = row.radius ?? row.koi_prad;
  const snr = row.koi_model_snr;
  const kepmag = row.koi_kepmag;
  const teq = row.koi_teq;
  const scoreRaw = row.score ?? row.koi_score ?? row.confidence ?? 0;
  const confidence = (() => {
    const v = typeof scoreRaw === "number" ? (scoreRaw <= 1 ? scoreRaw * 100 : scoreRaw) : 0;
    return Math.max(0, Math.min(100, v));
  })();

  const getClassificationColor = () => {
    switch (row.classification) {
      case "Confirmado":
        return {
          icon: CheckCircle,
          gradient: "from-emerald-500 to-green-500",
          bg: "bg-emerald-500/10",
          border: "border-emerald-400/30",
          text: "text-emerald-300",
        };
      case "Candidato":
        return {
          icon: AlertCircle,
          gradient: "from-cyan-500 to-blue-500",
          bg: "bg-cyan-500/10",
          border: "border-cyan-400/30",
          text: "text-cyan-300",
        };
      default:
        return {
          icon: XCircle,
          gradient: "from-rose-500 to-red-500",
          bg: "bg-rose-500/10",
          border: "border-rose-400/30",
          text: "text-rose-300",
        };
    }
  };

  const classColors = getClassificationColor();
  const ClassIcon = classColors.icon;

  const getPlanetSize = () => {
    if (!radius || !Number.isFinite(radius)) return "Desconocido";
    if (radius < 1.25) return "Sub-Tierra";
    if (radius < 2) return "Tierra";
    if (radius < 4) return "Super-Tierra";
    if (radius < 6) return "Mini-Neptuno";
    if (radius < 10) return "Neptuno";
    return "Júpiter";
  };

  const getHabitability = () => {
    if (!teq || !Number.isFinite(teq)) return null;
    if (teq > 200 && teq < 350)
      return { label: "Zona habitable", color: "text-emerald-400", icon: "🌍" };
    if (teq < 200) return { label: "Muy frío", color: "text-blue-400", icon: "❄️" };
    return { label: "Muy caliente", color: "text-orange-400", icon: "🔥" };
  };

  const habitability = getHabitability();

  const metrics = [
    {
      icon: Calendar,
      label: "Período orbital",
      value: fmtNumber(period, 2),
      unit: "días",
      description: "Tiempo que tarda en orbitar su estrella",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Ruler,
      label: "Radio planetario",
      value: fmtNumber(radius, 2),
      unit: "R⊕",
      description: `Categoría: ${getPlanetSize()}`,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Activity,
      label: "SNR de tránsito",
      value: fmtNumber(snr, 2),
      unit: "",
      description: "Relación señal-ruido del modelo",
      gradient: "from-orange-500 to-amber-500",
    },
    {
      icon: Star,
      label: "Magnitud Kepler",
      value: fmtNumber(kepmag, 2),
      unit: "mag",
      description: "Brillo aparente de la estrella anfitriona",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: Thermometer,
      label: "Temperatura de equilibrio",
      value: fmtNumber(teq, 0),
      unit: "K",
      description: habitability
        ? `${habitability.icon} ${habitability.label}`
        : "Temperatura estimada del planeta",
      gradient: "from-red-500 to-orange-500",
    },
    {
      icon: TrendingUp,
      label: "Confianza del modelo",
      value: confidence.toFixed(1),
      unit: "%",
      description: "Probabilidad de clasificación correcta",
      gradient: "from-indigo-500 to-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div
          className={`space-y-4 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Volver a resultados
          </button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Telescope className="w-8 h-8 text-cyan-400" />
                <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {row.id}
                </h1>
              </div>

              {/* Classification badge */}
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${classColors.border} ${classColors.bg}`}
              >
                <ClassIcon className={`w-5 h-5 ${classColors.text}`} />
                <span className={`font-semibold ${classColors.text}`}>{row.classification}</span>
              </div>
            </div>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-600 bg-slate-800/50 hover:bg-slate-700/50 transition-all"
            >
              <Download className="w-4 h-4" />
              Exportar datos
            </button>
          </div>
        </div>

        {/* Confidence Score Card */}
        <div
          className={`rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm p-6 transition-all duration-700 delay-100 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-purple-200">Nivel de confianza</h3>
                <p className="text-slate-400 text-sm">Probabilidad de clasificación correcta</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {confidence.toFixed(1)}%
              </div>
              <div className="w-full md:w-48 h-3 bg-slate-800 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div
          className={`grid md:grid-cols-2 gap-4 transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {metrics.map((metric, i) => {
            const Icon = metric.icon;
            return (
              <div
                key={i}
                className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:border-cyan-400/30 hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metric.gradient} bg-opacity-20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-400 text-sm mb-1">{metric.label}</div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span
                        className={`text-3xl font-bold bg-gradient-to-r ${metric.gradient} bg-clip-text text-transparent`}
                      >
                        {metric.value}
                      </span>
                      {metric.unit && <span className="text-slate-400 text-sm">{metric.unit}</span>}
                    </div>
                    <div className="flex items-start gap-1 text-xs text-slate-500">
                      <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span>{metric.description}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Orbital Visualization Placeholder */}
        <div
          className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 bg-opacity-20 flex items-center justify-center">
              <Orbit className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-semibold text-cyan-200">Visualización orbital</h3>
              <p className="text-slate-400 text-sm">Representación del sistema planetario</p>
            </div>
          </div>

          <div className="aspect-video rounded-xl bg-slate-900/50 border border-slate-700 flex items-center justify-center">
            <div className="text-center space-y-3">
              <Orbit className="w-16 h-16 mx-auto text-slate-600 animate-pulse" />
              <p className="text-slate-500">Visualización orbital próximamente</p>
              <p className="text-slate-600 text-sm">
                Período: {fmtNumber(period, 2)} días | Radio: {fmtNumber(radius, 2)} R⊕
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div
          className={`rounded-2xl border border-blue-400/20 bg-blue-500/5 backdrop-blur-sm p-6 transition-all duration-700 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-300 space-y-2">
              <p className="font-semibold text-blue-200">Acerca de esta clasificación</p>
              <p>
                Los datos provienen del catálogo de objetos de interés de Kepler (KOI).
                La clasificación ha sido determinada mediante un modelo de aprendizaje automático
                entrenado con características orbitales y observacionales.
              </p>
              {confidence > 80 && (
                <p className="text-emerald-300">
                  ✓ Alta confianza: Este objeto tiene una alta probabilidad de ser un{" "}
                  {row.classification.toLowerCase()}.
                </p>
              )}
              {confidence < 60 && (
                <p className="text-yellow-300">
                  ⚠ Confianza moderada: Se recomienda análisis adicional para confirmar la
                  clasificación.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
