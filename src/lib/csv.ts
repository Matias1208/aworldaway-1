import Papa from 'papaparse';
import type { ParseResult } from 'papaparse';
import type { ExoplanetRow, Label } from './types';
import { isFiniteNumber, toNumberLocale } from './format';

function inferLabel(row: Record<string, unknown>, score?: number): Label {
  const fp = ['koi_fpflag_ss','koi_fpflag_co','koi_fpflag_nt','koi_fpflag_ec'].some(k => {
    const v = row[k];
    const s = String(v ?? '').toLowerCase();
    return v === 1 || s === '1' || s === 'true' || s === 'yes';
  });
  if (fp) return 'Falso positivo';

  if (isFiniteNumber(score)) {
    if (score > 1) score = score / 100;
    if (score >= 0.8) return 'Confirmado';
    if (score >= 0.5) return 'Candidato';
  }

  const disp = String(row.koi_disposition ?? row.disposition ?? '').toLowerCase();
  if (disp.includes('confirm')) return 'Confirmado';
  if (disp.includes('candidate')) return 'Candidato';
  if (disp.includes('false')) return 'Falso positivo';

  return 'Candidato';
}

export async function parseCSV(file: File): Promise<ExoplanetRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      worker: true,
      dynamicTyping: false,
      delimitersToGuess: [',',';','\t','|'],
      transformHeader: h => h.trim(),
      // 👇 firma correcta: Error
      error(err: Error) { reject(err); },
      complete(results: ParseResult<Record<string, unknown>>) {
        const out: ExoplanetRow[] = results.data.map((row, i) => {
          const id = (
            (row.kepoi_name as string) ||
            (row.kepler_name as string) ||
            (row.koi_name as string) ||
            (row.id as string) ||
            `OBJ-${i+1}`
          ).toString().trim();

          const period = toNumberLocale(row.koi_period ?? row.period);
          const radius = toNumberLocale(row.koi_prad ?? row.radius);
          const snr    = toNumberLocale(row.koi_model_snr ?? row.snr);
          const kepmag = toNumberLocale(row.koi_kepmag ?? row.kmag);
          let score    = toNumberLocale(row.koi_score ?? row.score);
          if (isFiniteNumber(score) && score > 1) score = score / 100;
          const teq    = toNumberLocale(row.koi_teq ?? row.teq);
          const ra     = toNumberLocale(row.ra);

          const classification = inferLabel(row, score);

          return { id, period, radius, snr, kepmag, score, teq, ra, classification };
        });

        resolve(out.filter(r => r.id));
      },
    });
  });
}
