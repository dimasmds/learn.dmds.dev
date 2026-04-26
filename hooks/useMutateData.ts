'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useMutateData<T>(key: string[], mutator: (data: T) => Promise<void>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mutator,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
