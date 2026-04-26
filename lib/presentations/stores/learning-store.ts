'use client';

import { create } from 'zustand';

interface Unit {
  id: string;
  title: string;
  description: string;
  slug: string;
  order: number;
  lessonIds: string[];
}

interface Lesson {
  id: string;
  unitId: string;
  title: string;
  slug: string;
  description: string;
  order: number;
}

interface Step {
  id: string;
  type: string;
  order: number;
  instruction: string;
  content: Record<string, unknown>;
  xpReward: number;
}

interface LessonDetail {
  lesson: Lesson;
  steps: Step[];
}

interface UnitDetail {
  unit: Omit<Unit, 'lessonIds'>;
  lessons: Lesson[];
}

interface LearningState {
  units: Unit[];
  unitDetail: UnitDetail | null;
  lessonDetail: LessonDetail | null;
  isLoading: boolean;
  error: string | null;

  fetchUnits: () => Promise<void>;
  fetchUnitDetail: (unitId: string) => Promise<void>;
  fetchLessonDetail: (lessonId: string) => Promise<void>;
  clearError: () => void;
}

export const useLearningStore = create<LearningState>((set) => ({
  units: [],
  unitDetail: null,
  lessonDetail: null,
  isLoading: false,
  error: null,

  fetchUnits: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/units');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gagal memuat daftar unit');
      }

      set({ units: data.data, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan',
      });
    }
  },

  fetchUnitDetail: async (unitId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/units/detail?unitId=${encodeURIComponent(unitId)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gagal memuat detail unit');
      }

      set({ unitDetail: data.data, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan',
      });
    }
  },

  fetchLessonDetail: async (lessonId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/lessons/detail?lessonId=${encodeURIComponent(lessonId)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gagal memuat detail pelajaran');
      }

      set({ lessonDetail: data.data, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan',
      });
    }
  },

  clearError: () => set({ error: null }),
}));
