// src/components/UploadArea.tsx
import { useRef, useState } from "react";
import { parseCSV } from "../lib/csv";
import { useAppStore } from "../store/useAppStore";
import { useNavigate } from "react-router-dom";

export function UploadArea() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const setData = useAppStore((s) => s.setData);
  const nav = useNavigate();

  const handleFile = async (file?: File) => {
    if (!file || busy) return;
    try {
      setBusy(true);
      setMsg("Leyendo CSV…");
      const rows = await parseCSV(file);
      // AÚN SIN API: dejamos classification como venga o "Candidato"
      setData(rows);
      nav("/results");
    } catch (e: any) {
      setMsg(e?.message ?? "Error al procesar el archivo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        aria-label="Subir archivo CSV"
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") &&
          (document.getElementById("file") as HTMLInputElement)?.click()
        }
        onClick={() =>
          (document.getElementById("file") as HTMLInputElement)?.click()
        }
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          handleFile(f ?? undefined);
        }}
        className="glass p-8 text-center border-dashed border-2 border-white/20 hover:border-cyan-400/50 transition"
      >
        <div className="text-slate-300">
          Arrastra y suelta tu archivo CSV aquí
          <br />
          <span className="text-slate-400">o haz clic para seleccionar</span>
        </div>
      </div>

      <input
        id="file"
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0] ?? undefined)}
      />

      {msg && <p className="text-sm text-slate-300">{msg}</p>}
    </div>
  );
}
