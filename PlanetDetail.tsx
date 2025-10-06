import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Globe, Calendar, Ruler, Activity, Star,
  TrendingUp, Thermometer, ArrowLeft, Download,
  CheckCircle, AlertCircle, XCircle, Info,
  Telescope, Orbit
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";

// Local typing to avoid external dependencies
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

  useEffect(() => {
    setIsVisible(true);
    console.log('PlanetDetail mounted with id:', id);
    console.log('Available rows:', rows.length);
  }, [id, rows.length]);

  const decodedId = useMemo(
    () => decodeURIComponent((id ?? "").trim()),
    [id]
  );

  const row = useMemo(() => {
    console.log('Looking for planet with ID:', decodedId);
    const found = rows.find((r) => (r.id ?? "").trim() === decodedId);
    console.log('Found planet:', found);
    return found;
  }, [rows, decodedId]);

  const handleBack = () => {
    nav("/results");
  };

  const handleExport = () => {
    if (!row) return;
    
    // Exportar datos del planeta como JSON
    const dataStr = JSON.stringify(row, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${row.id}-data.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    console.log("Exported planet data:", row);
  };

  // No global data: take user to upload
  if (!rows?.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white grid place-items-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 mx-auto rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700">
            <Globe className="w-10 h-10 text-slate-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">No data loaded</h2>
            <p className="text-slate-400">Load a CSV file to start the analysis</p>
          </div>
          <button
            onClick={() => nav("/upload")}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-semibold hover:scale-105 transition-transform"
          >
            Go to upload
          </button>
        </div>
      </div>
    );
  }

  // Data exists but ID not found
  if (!row) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white grid place-items-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 mx-auto rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700">
            <AlertCircle className="w-10 h-10 text-slate-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Planet not found</h2>
            <p className="text-slate-400">The planet with ID "{decodedId}" was not found in the dataset</p>
          </div>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-semibold hover:scale-105 transition-transform"
          >
            Back to results
          </button>
        </div>
      </div>
    );
  }

  // Classification badge
  const getClassificationBadge = (classification: string) => {
    const base = "px-3 py-1 rounded-full text-sm font-semibold border";
    switch (classification) {
      case "Confirmed":
        return (
          <span className={`${base} bg-emerald-500/15 text-emerald-300 border-emerald-400/30 flex items-center gap-2`}>
            <CheckCircle className="w-4 h-4" />
            Confirmed
          </span>
        );
      case "Candidate":
        return (
          <span className={`${base} bg-cyan-500/15 text-cyan-300 border-cyan-400/30 flex items-center gap-2`}>
            <AlertCircle className="w-4 h-4" />
            Candidate
          </span>
        );
      case "False positive":
        return (
          <span className={`${base} bg-rose-500/15 text-rose-300 border-rose-400/30 flex items-center gap-2`}>
            <XCircle className="w-4 h-4" />
            False Positive
          </span>
        );
      default:
        return (
          <span className={`${base} bg-slate-500/10 text-slate-300 border-slate-400/20`}>
            {classification}
          </span>
        );
    }
  };

  // Stats cards data
  const statsCards = [
    {
      icon: Orbit,
      label: "Orbital Period",
      value: fmtNumber(row.period ?? row.koi_period, 2),
      unit: "days",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Ruler,
      label: "Planetary Radius",
      value: fmtNumber(row.radius ?? row.koi_prad, 2),
      unit: "R⊕",
      color: "from-emerald-500 to-green-500",
    },
    {
      icon: Activity,
      label: "Model SNR",
      value: fmtNumber(row.koi_model_snr, 1),
      unit: "",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Star,
      label: "Kepler Magnitude",
      value: fmtNumber(row.koi_kepmag, 2),
      unit: "mag",
      color: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 transition-all group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Results
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {row.id}
              </h1>
              <p className="text-slate-400">Exoplanet Candidate Details</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {getClassificationBadge(row.classification)}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200 transition-all"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`rounded-2xl border border-white/10 bg-gradient-to-br ${stat.color} bg-opacity-5 backdrop-blur-sm p-6 hover:scale-105 transition-all duration-300`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-20 flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                  <div className="flex items-baseline gap-1">
                    <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </div>
                    {stat.unit && (
                      <span className="text-slate-400 text-sm">{stat.unit}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Information */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Physical Properties */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 bg-opacity-20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-200">Physical Properties</h3>
                <p className="text-slate-400 text-sm">Planetary characteristics</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-slate-400">Classification</span>
                <span className="text-white font-medium">{row.classification}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-slate-400">Radius</span>
                <span className="text-white font-medium">
                  {fmtNumber(row.radius ?? row.koi_prad, 2)} R⊕
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-slate-400">Equilibrium Temperature</span>
                <span className="text-white font-medium">
                  {fmtNumber(row.koi_teq, 0)} K
                </span>
              </div>
            </div>
          </div>

          {/* Orbital Parameters */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 bg-opacity-20 flex items-center justify-center">
                <Orbit className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-200">Orbital Parameters</h3>
                <p className="text-slate-400 text-sm">Orbital characteristics</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-slate-400">Orbital Period</span>
                <span className="text-white font-medium">
                  {fmtNumber(row.period ?? row.koi_period, 2)} days
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-slate-400">Signal-to-Noise Ratio</span>
                <span className="text-white font-medium">
                  {fmtNumber(row.koi_model_snr, 1)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-slate-400">Kepler Magnitude</span>
                <span className="text-white font-medium">
                  {fmtNumber(row.koi_kepmag, 2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Confidence Score */}
        <div className="rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm p-6 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 bg-opacity-20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-200">Confidence Metrics</h3>
              <p className="text-slate-400 text-sm">Model confidence scores</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300">Detection Confidence</span>
                <span className="text-white font-bold">
                  {fmtNumber((row.confidence ?? row.koi_score ?? 0) * 100, 1)}%
                </span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                  style={{ width: `${(row.confidence ?? row.koi_score ?? 0) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Info className="w-5 h-5 text-cyan-400" />
              <p className="text-sm">
                This score represents the model's confidence in this detection being a real exoplanet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}