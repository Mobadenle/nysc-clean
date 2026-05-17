import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase }  from '../lib/supabase'
import { fetchResponses, createResponse, markBestAnswerQuery } from '../lib/queries'
import { useApp }  from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

export const responseKeys = {
  byIssue: (issueId) => ['responses', issueId],
}

export function useResponses(issueId) {
  const queryClient = useQueryClient()

  // Realtime: invalidate whenever a new response lands on this issue
  useEffect(() => {
    if (!issueId) return
    const channel = supabase
      .channel(`responses-${issueId}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'responses',
        filter: `issue_id=eq.${issueId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: responseKeys.byIssue(issueId) })
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [issueId, queryClient])

  return useQuery({
    queryKey: responseKeys.byIssue(issueId),
    queryFn:  () => fetchResponses(issueId),
    enabled:  !!issueId,
    staleTime: 0,
  })
}

export function useCreateResponse(issueId) {
  const queryClient     = useQueryClient()
  const { showToast }   = useApp()
  const { currentUser } = useAuth()

  return useMutation({
    mutationFn: ({ body, isAnonymous }) =>
      createResponse({
        issueId,
        body,
        isAnonymous,
        authorId:             currentUser?.id,
        isAmbassadorResponse: ['ambassador', 'moderator', 'admin'].includes(currentUser?.role),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: responseKeys.byIssue(issueId) })
      showToast('Response posted!', 'success')
    },
    onError: (err) => showToast(err.message || 'Failed to post response.', 'error'),
  })
}

export function useMarkBestAnswer(issueId) {
  const queryClient   = useQueryClient()
  const { showToast } = useApp()

  return useMutation({
    mutationFn: (responseId) => markBestAnswerQuery(responseId, issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: responseKeys.byIssue(issueId) })
      showToast('Best answer marked!', 'success')
    },
    onError: (err) => showToast(err.message, 'error'),
  })
}
