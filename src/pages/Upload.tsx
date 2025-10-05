import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, Sparkles } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import type { ExoplanetRow } from "../lib/types";

export default function Upload() {
  const nav = useNavigate();
  const setData = useAppStore((s) => s.setData);

  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // --- Mock para “Cargar datos de ejemplo” (mantiene la lógica de ir a /results)
  const loadExample = async () => {
    if (busy) return;
    setBusy(true);
    setMsg(null);

    const mock: any[] = Array.from({ length: 60 }, (_, i) => {
      const period = +(Math.random() * 300 + 0.5).toFixed(2);
      const radius = +(Math.random() * 12 + 0.5).toFixed(2);
      const snr = +(Math.random() * 40 + 1).toFixed(2);
      const kepmag = +(8 + Math.random() * 6).toFixed(2);
      const score = +Math.random().toFixed(3);
      const label =
        score < 0.33 ? "Falso positivo" : score > 0.66 ? "Confirmado" : "Candidato";

      return {
        id: `OBJ-${i + 1}`,
        classification: label,
        // Ambos nombres para que Results/Tabla funcionen con cualquiera:
        period,
        radius,
        koi_period: period,
        koi_prad: radius,
        koi_model_snr: snr,
        koi_kepmag: kepmag,
        koi_score: score,
        score,
      } as ExoplanetRow & Record<string, number | string>;
    });

    setTimeout(() => {
      setData(mock as ExoplanetRow[]);
      setBusy(false);
      nav("/results");
    }, 400);
  };

  // --- Dropzone “estético” (no funcional aún)
  const openFileDialog = () => {
    // Mantenemos el input para futuro, pero por ahora deshabilitado:
    inputRef.current?.blur();
    setMsg("Próximamente podrás subir tu CSV aquí. Usa el botón de ejemplo 👇");
  };

  return (
    <div className="min-h-screen bg-space text-white">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Volver al inicio */}
        <button
          onClick={() => nav("/")}
          className="text-cyan-300 hover:text-cyan-200 transition-colors"
        >
          ← Volver al inicio
        </button>

        {/* Título */}
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gradient">
            Carga de Datos
          </h1>
          <p className="text-slate-300">
            Sube tu dataset de exoplanetas o prueba con datos de ejemplo.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6 items-start">
          {/* Dropzone (estético, sin lógica de parseo aún) */}
          <div className="md:col-span-3">
            <div
              className="panel p-10 text-center border-dashed border-2 cursor-default"
              onClick={openFileDialog}
              role="button"
              aria-label="Zona para subir CSV (no funcional por ahora)"
              tabIndex={0}
            >
              <div className="flex justify-center mb-4">
                <UploadCloud className="w-16 h-16 text-slate-400" />
              </div>
              <p className="text-xl font-semibold">Arrastra tu archivo CSV aquí</p>
              <p className="text-slate-400 mt-1">
                o haz clic para seleccionar desde tu dispositivo
              </p>
              <div className="inline-block mt-4 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-400/30 text-cyan-200 text-sm">
                Próximamente • Formatos: CSV (separador , o ;)
              </div>

              {/* input presente pero deshabilitado por ahora */}
              <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                disabled
              />

              {msg && (
                <div className="mt-5 text-sm text-amber-200/90">
                  {msg}
                </div>
              )}
            </div>

            {/* Nota bajo el dropzone */}
            <div className="mt-4 panel p-4">
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-slate-200">Columnas sugeridas:</span>{" "}
                <code className="text-cyan-300">koi_score</code>,{" "}
                <code className="text-cyan-300">koi_period</code>,{" "}
                <code className="text-cyan-300">koi_model_snr</code>,{" "}
                <code className="text-cyan-300">koi_kepmag</code>,{" "}
                <code className="text-cyan-300">koi_prad</code>
              </p>
            </div>
          </div>

          {/* Lateral */}
          <div className="md:col-span-2 space-y-6">
            {/* Card “Primera vez” */}
            <div className="panel p-6 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-emerald-200">¿Primera vez?</h3>
              </div>
              <p className="text-slate-300 text-sm mb-4">
                Carga datos de ejemplo para ver los resultados y las gráficas.
              </p>
              <button
                onClick={loadExample}
                disabled={busy}
                className="btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? "Cargando…" : "Cargar datos de ejemplo"}
              </button>
            </div>

            {/* Ayuda */}
            <div className="panel p-6">
              <h3 className="font-semibold mb-3 text-slate-200">Formatos soportados</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• CSV de Kepler / TESS</li>
                <li>• Características: period, radius (o koi_period / koi_prad)</li>
                <li>• Extras: koi_model_snr, koi_kepmag, koi_score</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
