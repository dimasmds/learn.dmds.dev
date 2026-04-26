import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the hooks module to avoid React Query provider requirement
vi.mock('@/hooks/useGetData', () => ({
  useGetData: vi.fn((key: string[], fetcher: () => Promise<unknown>) => ({
    data: undefined,
    isLoading: true,
    error: null,
    refetch: vi.fn(),
  })),
}));

vi.mock('@/hooks/useMutateData', () => ({
  useMutateData: vi.fn((key: string[], mutator: (data: unknown) => Promise<unknown>) => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  })),
}));

import { useGetData } from '@/hooks/useGetData';
import { useMutateData } from '@/hooks/useMutateData';
import {
  useUnits,
  useUnitDetail,
  useLessonDetail,
  useUserProgress,
  useUpdateStepProgress,
} from '../useLesson';

describe('useLesson hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useUnits calls useGetData with units key', () => {
    useUnits();
    expect(useGetData).toHaveBeenCalledWith(['units'], expect.any(Function));
  });

  it('useUnitDetail calls useGetData with unit id key', () => {
    useUnitDetail('unit-1');
    expect(useGetData).toHaveBeenCalledWith(['unit', 'unit-1'], expect.any(Function));
  });

  it('useLessonDetail calls useGetData with lesson id key', () => {
    useLessonDetail('lesson-1');
    expect(useGetData).toHaveBeenCalledWith(['lesson', 'lesson-1'], expect.any(Function));
  });

  it('useUserProgress calls useGetData with progress key', () => {
    useUserProgress('user-1');
    expect(useGetData).toHaveBeenCalledWith(['progress', 'user-1'], expect.any(Function));
  });

  it('useUpdateStepProgress calls useMutateData with progress key', () => {
    useUpdateStepProgress();
    expect(useMutateData).toHaveBeenCalledWith(['progress'], expect.any(Function));
  });
});
