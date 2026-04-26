import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../ui-store';

describe('UIStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      sidebarOpen: false,
      activeModal: null,
      celebrationActive: false,
    });
  });

  it('should have correct initial state', () => {
    const state = useUIStore.getState();
    expect(state.sidebarOpen).toBe(false);
    expect(state.activeModal).toBeNull();
    expect(state.celebrationActive).toBe(false);
  });

  it('should toggle sidebar', () => {
    const { toggleSidebar } = useUIStore.getState();
    toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(true);

    toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(false);
  });

  it('should open modal', () => {
    const { openModal } = useUIStore.getState();
    openModal('confirm-exit');
    expect(useUIStore.getState().activeModal).toBe('confirm-exit');
  });

  it('should close modal', () => {
    useUIStore.getState().openModal('confirm-exit');
    expect(useUIStore.getState().activeModal).toBe('confirm-exit');

    useUIStore.getState().closeModal();
    expect(useUIStore.getState().activeModal).toBeNull();
  });

  it('should trigger celebration', () => {
    const { triggerCelebration } = useUIStore.getState();
    triggerCelebration();
    expect(useUIStore.getState().celebrationActive).toBe(true);
  });

  it('should stop celebration', () => {
    useUIStore.getState().triggerCelebration();
    expect(useUIStore.getState().celebrationActive).toBe(true);

    useUIStore.getState().stopCelebration();
    expect(useUIStore.getState().celebrationActive).toBe(false);
  });
});
