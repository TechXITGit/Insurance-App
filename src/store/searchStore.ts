import { create } from 'zustand';
import { storage } from '../utils/storage';
import { CategoryId } from '../types/insurance';

interface SearchState {
  query: string;
  selectedCategory: CategoryId | null;
  recentSearches: string[];
  setQuery: (q: string) => void;
  setSelectedCategory: (cat: CategoryId | null) => void;
  loadRecentSearches: () => Promise<void>;
  addRecentSearch: (term: string) => Promise<void>;
  clearRecentSearches: () => Promise<void>;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  selectedCategory: null,
  recentSearches: ['Family Health Cover', 'Optima Secure', 'Term 1 Crore', 'Travel Schengen', 'Care Supreme'],

  setQuery: (query) => set({ query }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),

  loadRecentSearches: async () => {
    const list = await storage.getItem<string[]>('recent_searches');
    if (list && list.length > 0) {
      set({ recentSearches: list });
    }
  },

  addRecentSearch: async (term: string) => {
    if (!term || term.trim() === '') return;
    const clean = term.trim();
    const current = get().recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase());
    const updated = [clean, ...current].slice(0, 8);
    set({ recentSearches: updated });
    await storage.setItem('recent_searches', updated);
  },

  clearRecentSearches: async () => {
    set({ recentSearches: [] });
    await storage.removeItem('recent_searches');
  },
}));
