'use client';

import { create } from 'zustand';

interface ProgressItem {
  id: string;
  stepId: string;
  lessonId: string;
  status: string;
  attempts: number;
  completedAt: string | null;
}

interface ProgressState {
  progress: ProgressItem[];
  isLoading: boolean;
  error: string | null;

  fetchProgress: (userId: string) => Promise<void>;
  updateStepProgress: (userId: string, stepId: string, status: string) => Promise<void>;
  clearError: () => void;
}

export const useProgressStore = create<ProgressState>((set) => ({
  progress: [],
  isLoading: false,
  error: null,

  fetchProgress: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/progress?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gagal memuat progress');
      }

      set({ progress: data.data, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan',
      });
    }
  },

  updateStepProgress: async (userId: string, stepId: string, status: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/progress/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, stepId, status }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gagal memperbarui progress');
      }

      const updatedItem: ProgressItem = data.data;

      set((state) => {
        const existingIndex = state.progress.findIndex(
          (item) => item.stepId === updatedItem.stepId
        );

        if (existingIndex !== -1) {
          const updatedProgress = [...state.progress];
          updatedProgress[existingIndex] = updatedItem;
          return { progress: updatedProgress, isLoading: false };
        }

        return { progress: [...state.progress, updatedItem], isLoading: false };
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan',
      });
    }
  },

  clearError: () => set({ error: null }),
}));
