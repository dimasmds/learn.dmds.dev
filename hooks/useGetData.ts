'use client';

import { useQuery } from '@tanstack/react-query';

export function useGetData<T>(key: string[], fetcher: () => Promise<T>) {
  return useQuery({ queryKey: key, queryFn: fetcher });
}
