export type Label = "Confirmado" | "Candidato" | "Falso positivo" | string;

export interface ExoplanetRow {
  id: string;
  classification: Label;
  score?: number;

  // campos “neutros”
  period?: number;
  radius?: number;

  // alias KOI por si vienen desde el CSV
  koi_period?: number;
  koi_prad?: number;
  koi_model_snr?: number;
  koi_kepmag?: number;
  koi_teq?: number;
  koi_score?: number;
}
