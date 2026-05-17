import { useAuth }        from '../../context/AuthContext'
import { useTrustEvents } from '../../hooks/useProfile'
import ProfileCard        from '../../components/profile/ProfileCard'
import TrustBreakdown     from '../../components/profile/TrustBreakdown'
import ActivityFeed       from '../../components/dashboard/ActivityFeed'
import LoadingSpinner     from '../../components/ui/LoadingSpinner'

function getInitials(name) {
  if (!name) return 'NH'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function ProfilePage() {
  const { currentUser }                      = useAuth()
  const { data: trustEvents = [], isLoading } = useTrustEvents(currentUser?.id)

  if (!currentUser) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <LoadingSpinner size={32} />
    </div>
  )

  const userForCard = {
    name:        currentUser.full_name,
    initials:    getInitials(currentUser.full_name),
    color:       '#2F5BE8',
    trust:       currentUser.trust_score,
    ambassador:  ['ambassador', 'moderator', 'admin'].includes(currentUser.role),
    solvedCount: trustEvents.filter(e => e.event_type === 'issue_marked_solved').length,
    state:       currentUser.state,
    batch:       currentUser.batch,
  }

  const userForTrust = { trust: currentUser.trust_score }

  const activities = trustEvents.slice(0, 6).map(ev => ({
    text: ev.reason || ev.event_type.replace(/_/g, ' '),
    time: new Date(ev.created_at).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    icon: ev.delta >= 0 ? '⭐' : '⚠️',
  }))

  return (
    <div className="page-content animate-in" style={{ maxWidth: 780 }}>
      <ProfileCard user={userForCard} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <TrustBreakdown user={userForTrust} />
        <div className="card">
          <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Recent Activity</h3>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}><LoadingSpinner size={20} /></div>
          ) : (
            <ActivityFeed activities={activities.length ? activities : undefined} />
          )}
        </div>
      </div>
    </div>
  )
}
