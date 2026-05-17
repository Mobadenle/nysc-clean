import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchIssues, fetchIssueById, createIssue, markIssueSolvedQuery, incrementViewCount } from '../lib/queries'
import { useApp } from '../context/AppContext'

export const issueKeys = {
  all:    ()        => ['issues'],
  list:   (filters) => ['issues', 'list', filters],
  detail: (id)      => ['issues', 'detail', id],
}

export function useIssues(filters = {}) {
  return useQuery({
    queryKey: issueKeys.list(filters),
    queryFn:  () => fetchIssues(filters),
    staleTime: 30_000,
  })
}

export function useIssue(id) {
  return useQuery({
    queryKey: issueKeys.detail(id),
    queryFn:  async () => {
      const issue = await fetchIssueById(id)
      incrementViewCount(id)
      return issue
    },
    enabled:   !!id,
    staleTime: 10_000,
  })
}

export function useCreateIssue() {
  const queryClient   = useQueryClient()
  const { showToast } = useApp()

  return useMutation({
    mutationFn: (payload) => createIssue(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: issueKeys.all() })
    },
    onError: (err) => {
      showToast(err.message || 'Failed to post issue.', 'error')
    },
  })
}

export function useMarkSolved() {
  const queryClient   = useQueryClient()
  const { showToast } = useApp()

  return useMutation({
    mutationFn: ({ issueId, responseId }) => markIssueSolvedQuery(issueId, responseId),
    onSuccess: (_data, { issueId }) => {
      queryClient.invalidateQueries({ queryKey: issueKeys.detail(issueId) })
      queryClient.invalidateQueries({ queryKey: issueKeys.all() })
      showToast('Issue marked as solved! 🎉', 'success')
    },
    onError: (err) => showToast(err.message, 'error'),
  })
}
