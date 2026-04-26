import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  activeModal: string | null;
  celebrationActive: boolean;
}

interface UIActions {
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  triggerCelebration: () => void;
  stopCelebration: () => void;
}

export const useUIStore = create<UIState & UIActions>()((set) => ({
  sidebarOpen: false,
  activeModal: null,
  celebrationActive: false,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
  triggerCelebration: () => set({ celebrationActive: true }),
  stopCelebration: () => set({ celebrationActive: false }),
}));
