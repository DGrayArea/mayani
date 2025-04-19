import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  chain: 'all' | 'sol' | 'eth' | 'usdt';
  sortBy: 'volume' | 'marketCap' | 'age' | 'price' | 'priceChange';
  sortDirection: 'asc' | 'desc';
}

export interface FilterValidation {
  isValid: boolean;
  errors: {
    [key in keyof Filters]?: string;
  };
}

interface FilterState {
  filters: Filters;
  activeFilterCount: number;
  isFilterSheetOpen: boolean;
  validation: FilterValidation;
  setFilters: (updatedFilters: Partial<Filters>) => void;
  resetFilters: () => void;
  validateFilters: () => FilterValidation;
  toggleFilterSheet: () => void;
  setFilterSheet: (isOpen: boolean) => void;
  applyPreset: (preset: 'trending' | 'newListings' | 'gainers' | 'losers') => void;
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
  chain: 'all',
  sortBy: 'volume',
  sortDirection: 'desc',
};

const defaultValidation: FilterValidation = {
  isValid: true,
  errors: {},
};

// Helper functions
const parseNumericInput = (value: string): number | null => {
  if (!value) return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
};

const validateNumericRange = (from: string, to: string): boolean => {
  const fromValue = parseNumericInput(from);
  const toValue = parseNumericInput(to);
  
  if (fromValue === null || toValue === null) return true;
  return fromValue <= toValue;
};

const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      filters: defaultFilters,
      activeFilterCount: 0,
      isFilterSheetOpen: false,
      validation: defaultValidation,
      
      setFilters: (updatedFilters: Partial<Filters>) => {
        const currentFilters = get().filters;
        const newFilters = { ...currentFilters, ...updatedFilters };
        
        // Count active filters
        const countActiveFilters = () => {
          let count = 0;
          const filters = newFilters;
          
          // Count boolean filters that are true
          if (filters.mintAuth) count++;
          if (filters.freezeAuth) count++;
          if (filters.lpBurned) count++;
          if (filters.top10Holders) count++;
          if (filters.withSocial) count++;
          
          // Count range filters that have at least one value
          if (filters.liquidityFrom || filters.liquidityTo) count++;
          if (filters.volumeFrom || filters.volumeTo) count++;
          if (filters.ageFrom || filters.ageTo) count++;
          if (filters.marketCapFrom || filters.marketCapTo) count++;
          
          // Count chain filter if not 'all'
          if (filters.chain !== 'all') count++;
          
          return count;
        };
        
        const validation = {
          isValid: true,
          errors: {} as { [key in keyof Filters]?: string },
        };
        
        // Validate numeric ranges
        if (!validateNumericRange(newFilters.liquidityFrom, newFilters.liquidityTo)) {
          validation.isValid = false;
          validation.errors.liquidityFrom = 'Min value must be less than max';
        }
        
        if (!validateNumericRange(newFilters.volumeFrom, newFilters.volumeTo)) {
          validation.isValid = false;
          validation.errors.volumeFrom = 'Min value must be less than max';
        }
        
        if (!validateNumericRange(newFilters.marketCapFrom, newFilters.marketCapTo)) {
          validation.isValid = false;
          validation.errors.marketCapFrom = 'Min value must be less than max';
        }
        
        if (!validateNumericRange(newFilters.ageFrom, newFilters.ageTo)) {
          validation.isValid = false;
          validation.errors.ageFrom = 'Min value must be less than max';
        }
        
        set({
          filters: newFilters,
          activeFilterCount: countActiveFilters(),
          validation,
        });
      },
      
      resetFilters: () => {
        set({
          filters: defaultFilters,
          activeFilterCount: 0,
          validation: defaultValidation,
        });
      },
      
      validateFilters: () => {
        const validation = get().validation;
        return validation;
      },
      
      toggleFilterSheet: () => {
        set((state) => ({
          isFilterSheetOpen: !state.isFilterSheetOpen,
        }));
      },
      
      setFilterSheet: (isOpen: boolean) => {
        set({ isFilterSheetOpen: isOpen });
      },
      
      applyPreset: (preset: 'trending' | 'newListings' | 'gainers' | 'losers') => {
        switch (preset) {
          case 'trending':
            set({
              filters: {
                ...defaultFilters,
                withSocial: true,
                sortBy: 'volume',
                sortDirection: 'desc',
              },
              activeFilterCount: 1,
            });
            break;
            
          case 'newListings':
            set({
              filters: {
                ...defaultFilters,
                ageFrom: '0',
                ageTo: '7',
                sortBy: 'age',
                sortDirection: 'asc',
              },
              activeFilterCount: 1,
            });
            break;
            
          case 'gainers':
            set({
              filters: {
                ...defaultFilters,
                sortBy: 'priceChange',
                sortDirection: 'desc',
              },
              activeFilterCount: 0,
            });
            break;
            
          case 'losers':
            set({
              filters: {
                ...defaultFilters,
                sortBy: 'priceChange',
                sortDirection: 'asc',
              },
              activeFilterCount: 0,
            });
            break;
        }
      },
    }),
    {
      name: "filter-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useFilterStore;
