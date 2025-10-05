import { create } from "zustand";
import type { ExoplanetRow, ExoplanetCandidate, User } from "../lib/types";
import { candidatesToRows } from "../lib/api-utils";

type State = {
  // Legacy data for backward compatibility
  data: ExoplanetRow[];
  setData: (rows: ExoplanetRow[]) => void;

  // New API data
  candidates: ExoplanetCandidate[];
  setCandidates: (candidates: ExoplanetCandidate[]) => void;

  // User state
  user: User | null;
  setUser: (user: User | null) => void;

  // UI state
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;

  // Actions
  updateCandidatesFromApi: (candidates: ExoplanetCandidate[]) => void;
};

export const useAppStore = create<State>((set, get) => ({
  // Legacy state
  data: [],
  setData: (rows) => set({ data: rows }),

  // New API state
  candidates: [],
  setCandidates: (candidates) => set({ candidates }),

  // User state
  user: null,
  setUser: (user) => set({ user }),

  // UI state
  loading: false,
  setLoading: (loading) => set({ loading }),
  error: null,
  setError: (error) => set({ error }),

  // Actions
  updateCandidatesFromApi: (candidates) => {
    // Update both new and legacy formats
    const legacyRows = candidatesToRows(candidates);
    set({
      candidates,
      data: legacyRows
    });
  },
}));
