import { useQuery } from '@tanstack/react-query'
import { fetchCategories } from '../lib/queries'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn:  fetchCategories,
    staleTime: Infinity,
    gcTime:    Infinity,
  })
}
