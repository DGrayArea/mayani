import { create } from "zustand";

export interface Filters {
  mintAuth: boolean;
  freezeAuth: boolean;
  lpBurned: boolean;
  top10Holders: boolean;
  withSocial: boolean;
  liquidityFrom: string;
  liquidityTo: string;
  volumeFrom: string;
  volumeTo: string;
  ageFrom: string;
  ageTo: string;
  marketCapFrom: string;
  marketCapTo: string;
}

interface FilterState {
  filters: Filters;
  setFilters: (updatedFilters: Partial<Filters>) => void;
  resetFilters: () => void;
}

const defaultFilters: Filters = {
  mintAuth: false,
  freezeAuth: false,
  lpBurned: false,
  top10Holders: false,
  withSocial: true,
  liquidityFrom: "",
  liquidityTo: "",
  volumeFrom: "",
  volumeTo: "",
  ageFrom: "",
  ageTo: "",
  marketCapFrom: "",
  marketCapTo: "",
};

const useFilterStore = create<FilterState | any>((set) => ({
  filters: defaultFilters,
  setFilters: (updatedFilters: any) =>
    set((state: any) => ({
      filters: {
        ...state.filters,
        ...updatedFilters,
      },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
}));

export default useFilterStore;
