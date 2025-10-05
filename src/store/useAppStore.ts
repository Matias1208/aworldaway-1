import { create } from "zustand";
import type { ExoplanetRow } from "../lib/types";

type State = {
  data: ExoplanetRow[];
  setData: (rows: ExoplanetRow[]) => void;
};

export const useAppStore = create<State>((set) => ({
  data: [],
  setData: (rows) => set({ data: rows }),
}));
