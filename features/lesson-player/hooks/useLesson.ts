'use client';

import { useGetData } from '@/hooks/useGetData';
import { useMutateData } from '@/hooks/useMutateData';
import type { Unit, UnitDetail, LessonDetail, ProgressItem } from '../types';

// Fetch all units
export function useUnits() {
  return useGetData<Unit[]>(['units'], () =>
    fetch('/api/units').then(r => r.json()).then(d => d.data)
  );
}

// Fetch unit detail with lessons
export function useUnitDetail(unitId: string) {
  return useGetData<UnitDetail>(['unit', unitId], () =>
    fetch(`/api/units/detail?unitId=${unitId}`).then(r => r.json()).then(d => d.data)
  );
}

// Fetch lesson detail with steps
export function useLessonDetail(lessonId: string) {
  return useGetData<LessonDetail>(['lesson', lessonId], () =>
    fetch(`/api/lessons/detail?lessonId=${lessonId}`).then(r => r.json()).then(d => d.data)
  );
}

// Fetch user progress
export function useUserProgress(userId: string) {
  return useGetData<ProgressItem[]>(['progress', userId], () =>
    fetch(`/api/progress?userId=${userId}`).then(r => r.json()).then(d => d.data)
  );
}

// Update step progress (mutation)
export function useUpdateStepProgress() {
  return useMutateData<{ userId: string; stepId: string; status: string }>(
    ['progress'],
    (data) => fetch('/api/progress/step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json())
  );
}
