A World Away — Hunting for Exoplanets with AI (Frontend)

Interfaz web (React + Vite + TypeScript + Tailwind) para cargar catálogos de exoplanetas (Kepler/TESS), visualizarlos y explorar detalles por objeto. El objetivo es ofrecer una UX pulida tipo “herramienta científica”, con dashboards, gráficos y una vista de detalle por planeta/lista KOI.

✨ Características

Landing con fondo animado, CTA y microinteracciones.

Carga de datos (Upload) con dropzone accesible y botón de “ejemplo”.

Resultados (Results) con KPIs, gráficos (pastel, barras, dispersión) y tabla.

Detalle (PlanetDetail) con métricas clave (período, radio, SNR, mag, Teq, confianza).

Diseño: tema oscuro espacial, gradientes cian/azules/púrpura, alto contraste.

🧱 Estructura del proyecto
/src
  /components
    ResultsTable.tsx           # Vista de tabla (si la usas)
  /lib
    csv.ts                     # parseo de CSV (parseCSVFile)
    format.ts                  # utilidades: fmtNumber, isFiniteNumber
    types.ts                   # tipos compartidos (ExoplanetRow, etc.)
  /pages
    Landing.tsx                # Portada con CTA
    Upload.tsx                 # Dropzone + carga de ejemplo
    Results.tsx                # Dashboard (KPIs + gráficos + tabla)
    PlanetDetail.tsx           # Vista individual por planeta/KOI
  /store
    useAppStore.ts             # (opcional) Zustand para estado global
  /styles
    index.css                  # Tailwind + utilidades
  App.tsx                      # Router principal
  main.tsx                     # Bootstrap React
  index.css                    # Tailwind entry (si la usas aquí)


Nota: según la versión final, puedes usar mock data en Results.tsx/PlanetDetail.tsx o leer los datos reales desde el store (Zustand) tras Upload.

🚦 Flujo de la app

Landing → Upload
El CTA “Comenzar análisis” navega a /upload.

Upload

Dropzone: arrastra/selecciona un .csv.

Botón “datos de ejemplo”: carga mock y navega a /results.

(Cuando conectes parseCSVFile(file)) guardas datos en el store y navegas a resultados.

Results

Calcula KPIs (totales, confirmados, candidatos, falsos).

Gráficos: pastel por clasificación, barras por bins de radio, dispersión radio vs período.

Botones: Volver a carga, Exportar (stub).

Tabla de datos o “preview” con contador (según la versión que uses).

PlanetDetail

Muestra métricas del KOI seleccionado (período, radio, SNR, Kepmag, Teq, confianza).

Botón Volver a resultados.

🧩 Tipos principales

src/lib/types.ts (ejemplo recomendado)

export type Label = "Confirmado" | "Candidato" | "Falso positivo";

export interface ExoplanetRow {
  id: string;                 // KOI u otro identificador
  classification: Label;      // etiqueta proveniente del modelo
  // Núcleo mínimo recomendado para gráficos/tabla:
  radius?: number;            // R_⊕ (o koi_prad)
  koi_prad?: number;          // radio planetario del CSV
  period?: number;            // días (o koi_period)
  koi_period?: number;        // período orbital del CSV

  // Variables de tu modelo:
  koi_score?: number;         // Disposition score (0..1 o 0..100)
  koi_model_snr?: number;     // SNR de tránsito
  koi_kepmag?: number;        // Magnitud Kepler (mag)
  koi_teq?: number;           // Temp. de equilibrio (K)

  // Si tu pipeline expone confianza explícita:
  confidence?: number;        // 0..1 (opcional)
}

🧮 Utilidades de formato

src/lib/format.ts

export function isFiniteNumber(val: unknown): val is number {
  return typeof val === "number" && Number.isFinite(val);
}

export function fmtNumber(val: unknown, digits = 2): string {
  return isFiniteNumber(val) ? (val as number).toFixed(digits) : "—";
}

📥 Parseo de CSV

src/lib/csv.ts — punto único para convertir CSV → ExoplanetRow[].

import Papa from "papaparse";
import type { ExoplanetRow, Label } from "./types";

const CLASS_MAP = new Map<string, Label>([
  ["confirmed", "Confirmado"],
  ["candidate", "Candidato"],
  ["false positive", "Falso positivo"],
]);

const toNumber = (v: unknown) => {
  if (typeof v === "number") return Number.isFinite(v) ? v : undefined;
  if (typeof v === "string") {
    const s = v.trim().replace(",", "."); // 3,14 → 3.14
    if (s === "") return undefined;
    const n = Number(s);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
};

function normalizeLabel(v: unknown): Label | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim().toLowerCase();
  for (const [key, label] of CLASS_MAP) {
    if (s.includes(key)) return label;
  }
  return undefined;
}

export function parseCSVFile(file: File): Promise<ExoplanetRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      worker: true,
      error(error) {
        // Tipado de @types/papaparse exige (error: Error)
        reject(error);
      },
      complete(results) {
        if (results.errors?.length) {
          // Toma el primer error para mostrarlo
          return reject(new Error(results.errors[0].message));
        }

        const rows: ExoplanetRow[] = (results.data || []).map((r, i) => {
          // Intenta resolver id desde posibles columnas
          const rawId =
            (r["id"] as string) ??
            (r["koi_name"] as string) ??
            (r["kepoi_name"] as string) ??
            (r["kepid"] as string) ??
            `OBJ-${i + 1}`;

          const id = String(rawId).trim();

          const classification: Label =
            normalizeLabel(r["classification"]) ??
            normalizeLabel(r["koi_disposition"]) ??
            normalizeLabel(r["koi_pdisposition"]) ??
            "Candidato";

          // Período y radio — admite claves alternativas
          const period = toNumber(r["period"]) ?? toNumber(r["koi_period"]);
          const radius = toNumber(r["radius"]) ?? toNumber(r["koi_prad"]);

          return {
            id,
            classification,
            period,
            koi_period: toNumber(r["koi_period"]),
            radius,
            koi_prad: toNumber(r["koi_prad"]),
            koi_score: toNumber(r["koi_score"]),
            koi_model_snr: toNumber(r["koi_model_snr"]),
            koi_kepmag: toNumber(r["koi_kepmag"]),
            koi_teq: toNumber(r["koi_teq"]),
          };
        });

        resolve(rows);
      },
    });
  });
}

Columnas esperadas (mínimas útiles)

Obligatorias para gráficos/tabla:
id, classification (o koi_disposition/koi_pdisposition), koi_period, koi_prad

Recomendadas:
koi_score, koi_model_snr, koi_kepmag, koi_teq

Flags opcionales:
koi_fpflag_ss, koi_fpflag_co, koi_fpflag_nt, koi_fpflag_ec

El parser es tolerante: si falta period usa koi_period; si falta radius usa koi_prad. Los numéricos se limpian (coma→punto) y valores vacíos producen undefined, nunca 0 por defecto.

🧭 Routing

src/App.tsx (ya lo tienes así)

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Upload from "./pages/Upload";
import Results from "./pages/Results";
import PlanetDetail from "./pages/PlanetDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/results" element={<Results />} />
        <Route path="/planet/:id" element={<PlanetDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

🖥️ Páginas
1) Landing.tsx

Fondo animado (estrellas, orbes con parallax).

Copy y CTA principal “Comenzar análisis” → /upload.

Tarjetas de features y stats con gradientes.

Clave de navegación:

import { useNavigate } from "react-router-dom";
// ...
const nav = useNavigate();
const handleStart = () => nav("/upload");

2) Upload.tsx

Dropzone accesible (click/drag&drop/teclado).

Al seleccionar .csv → parseCSVFile(file) → guardar en store → nav("/results").

Botón “Cargar datos de ejemplo” (mock) cuando no tengas backend listo.

Botón “Volver al inicio” → /.

Si aún no conectas store, deja la simulación (mock) y navega a resultados para revisar UI.

3) Results.tsx

KPIs: total, confirmados, candidatos, falsos.

Gráficos:

Pie por clasificación.

Barras por bins de radio (Sub-Tierra…Júpiter+).

Dispersión radio vs período, coloreado por clasificación.

Tabla (o placeholder) con contador y filtro (si lo integras).

Si trabajas con mock: const rows = mockRows;.
Cuando conectes store: const rows = useAppStore(s => s.data);.

4) PlanetDetail.tsx

Muestra detalle de un KOI (id desde useParams()).

Métricas: período, radio, SNR, Kepmag, Teq, confianza.

Badges por clasificación con color coherente.

Botón “Volver a resultados”.

Si aún no conectas store/params, puedes usar mockPlanet para diseñar la UI.

🎨 Estilos

TailwindCSS + utilidades propias en src/styles/index.css.

Gradientes: from-cyan-500, to-blue-500, to-purple-500, etc.

Components con backdrop blur, borders suaves, hover scale y focus state.

▶️ Cómo ejecutar
# 1) Instalar dependencias
npm install

# 2) (Opcional) Tipos para PapaParse
npm i -D @types/papaparse

# 3) Arrancar dev server
npm run dev

# 4) Abrir
# http://localhost:5173


Si Tailwind no se generó vía npx tailwindcss init -p, asegúrate de tener:

tailwind.config.js/ts

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};


postcss.config.js

export default { plugins: { tailwindcss: {}, autoprefixer: {} } }


src/styles/index.css

@tailwind base;
@tailwind components;
@tailwind utilities;


Y que index.css/main.tsx importen ./styles/index.css.

🧪 Conectar datos reales

En Upload.tsx, importa y usa:

import { parseCSVFile } from "../lib/csv";
import { useAppStore } from "../store/useAppStore";
// ...
const setData = useAppStore(s => s.setData);
const rows = await parseCSVFile(file);
setData(rows);
nav("/results");


En Results.tsx y PlanetDetail.tsx, lee desde el store:

const rows = useAppStore(s => s.data);


En PlanetDetail.tsx, toma el id de la URL:

const { id } = useParams();
const row = rows.find(r => r.id === id);

♿ Accesibilidad & UX

Dropzone con role="button", tabIndex={0}, aria-label.

Enter/Space abren selector de archivos.

Mensajes de error claros (CSV inválido, columnas faltantes).

Colores con suficiente contraste (revisado sobre fondo oscuro).

🛠️ Troubleshooting

“No exported member” (fmt / isFiniteNumber)
Asegúrate que format.ts exporte exactamente fmtNumber e isFiniteNumber y que el import coincida:

import { fmtNumber, isFiniteNumber } from "../lib/format";


“No default export” en Results
Si Results es named export:

// Results.tsx
export function Results() { ... }
// App.tsx
import { Results } from "./pages/Results";


Tipos PapaParse
Instala tipos:

npm i -D @types/papaparse


OneDrive/Windows + rutas
Evita espacios excesivos/acentos en rutas. En caso de problemas con HMR, reinicia npm run dev.

Gráficos no visibles
Asegúrate que cada <ResponsiveContainer> tenga un contenedor padre con altura fija (h-64, h-80, etc.).

🗺️ Roadmap corto

 Integrar store (Zustand) para pasar datos reales de Upload → Results → PlanetDetail.

 Tabla interactiva completa (paginación, filtros, ordenar).

 Carga progresiva y validación de cabeceras (Kepler/TESS).

 Exportar CSV/JSON desde Results/Detail.

 Dark/Light toggle (opcional).

 Conectar a backend de inferencia (cuando esté listo).