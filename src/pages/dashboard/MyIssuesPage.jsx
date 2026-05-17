import { useState }   from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth }     from '../../context/AuthContext'
import { useIssues }   from '../../hooks/useIssues'
import IssueCard       from '../../components/issues/IssueCard'
import EmptyState      from '../../components/ui/EmptyState'
import LoadingSpinner  from '../../components/ui/LoadingSpinner'
import Button          from '../../components/ui/Button'
import { normalizeIssue } from '../../utils/normalize'

export default function MyIssuesPage() {
  const { currentUser } = useAuth()
  const navigate        = useNavigate()
  const [tab, setTab]   = useState('all')

  // Fetch all issues then filter client-side by author_id
  // (add server-side author filter to useIssues/fetchIssues if list grows large)
  const { data: raw = [], isLoading } = useIssues({ sortKey: 'recent' })
  const myRaw    = raw.filter(i => i.author_id === currentUser?.id)
  const myIssues = myRaw.map(normalizeIssue)

  const displayed =
    tab === 'solved' ? myIssues.filter(i => i.solved)  :
    tab === 'open'   ? myIssues.filter(i => !i.solved) :
    myIssues

  return (
    <div className="page-content animate-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>My Issues</h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
          {isLoading ? 'Loading...' : `${myIssues.length} issue${myIssues.length !== 1 ? 's' : ''} posted`}
        </p>
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        {[['all','All Issues'],['open','Open'],['solved','Solved']].map(([v, l]) => (
          <div key={v} className={`tab ${tab === v ? 'active' : ''}`} onClick={() => setTab(v)}>{l}</div>
        ))}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><LoadingSpinner size={28} /></div>
      ) : displayed.length === 0 ? (
        <EmptyState
          icon="📋"
          title={tab === 'all' ? 'No issues posted yet' : `No ${tab} issues`}
          text={tab === 'all' ? 'Post your first issue to get community help.' : ''}
          action={tab === 'all' ? <Button onClick={() => navigate('/post-issue')}>Post an Issue</Button> : null}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {displayed.map(issue => <IssueCard key={issue.id} issue={issue} />)}
        </div>
      )}
    </div>
  )
}
