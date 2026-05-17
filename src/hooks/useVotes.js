import { useState, useCallback, useEffect } from 'react'
import { castVoteQuery, removeVoteQuery } from '../lib/queries'
import { useAuth } from '../context/AuthContext'
import { useApp }  from '../context/AppContext'

export function useVote({ targetId, type, initialCount = 0 }) {
  const { currentUser } = useAuth()
  const { showToast }   = useApp()

  const [voted,     setVoted]     = useState(false)
  const [voteId,    setVoteId]    = useState(null)
  const [voteCount, setVoteCount] = useState(initialCount)
  const [loading,   setLoading]   = useState(false)

  useEffect(() => { setVoteCount(initialCount) }, [initialCount])

  const toggle = useCallback(async () => {
    if (!currentUser) { showToast('Sign in to vote.', 'info'); return }
    if (loading) return

    const wasVoted = voted
    // Optimistic update
    setVoted(!wasVoted)
    setVoteCount(c => wasVoted ? c - 1 : c + 1)
    setLoading(true)

    try {
      if (wasVoted && voteId) {
        await removeVoteQuery(voteId)
        setVoteId(null)
      } else {
        const data = await castVoteQuery({
          issueId:    type === 'issue'    ? targetId : null,
          responseId: type === 'response' ? targetId : null,
          userId:     currentUser.id,
        })
        setVoteId(data.id)
      }
    } catch (err) {
      // Rollback
      setVoted(wasVoted)
      setVoteCount(c => wasVoted ? c + 1 : c - 1)
      showToast(
        err.code === '23505' ? 'You already voted on this.' : 'Vote failed. Try again.',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }, [currentUser, loading, voted, voteId, targetId, type, showToast])

  return { voted, setVoted, voteCount, setVoteCount, toggle, loading, setVoteId }
}
