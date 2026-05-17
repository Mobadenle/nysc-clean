import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth }          from '../../context/AuthContext'
import { useNotifications } from '../../hooks/useNotifications'
import { NAV_ITEMS }        from '../../data/constants'
import Avatar               from '../ui/Avatar'
import Icon                 from '../ui/Icon'

const SECTIONS       = ['main', 'account', 'ambassador']
const SECTION_LABELS = { main: 'Platform', account: 'My Account', ambassador: 'Ambassador' }

function getInitials(name) {
  if (!name) return 'NH'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function Sidebar({ isOpen, onClose }) {
  const { currentUser } = useAuth()
  const { unreadCount } = useNotifications()
  const navigate        = useNavigate()
  const { pathname }    = useLocation()

  const go = (path) => { navigate(path); onClose() }

  const avatarUser = {
    initials: getInitials(currentUser?.full_name),
    color:    '#2F5BE8',
  }

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-mark">NH</div>
          <div>
            <div className="logo-text">NYSC HelpDesk</div>
            <div className="logo-sub">Community Support Platform</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {SECTIONS.map(section => (
            <div key={section}>
              <div className="nav-section-label">{SECTION_LABELS[section]}</div>
              {NAV_ITEMS.filter(i => i.section === section).map(item => {
                const to       = `/${item.id}`
                const isActive = pathname === to || pathname.startsWith(to + '/')
                const badge    = item.id === 'notifications' ? unreadCount : (item.badge ?? 0)
                return (
                  <div
                    key={item.id}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => go(to)}
                  >
                    <span className="nav-icon"><Icon name={item.icon} size={16} /></span>
                    {item.label}
                    {badge > 0 && <span className="nav-badge">{badge}</span>}
                  </div>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card" onClick={() => go('/profile')}>
            <Avatar user={avatarUser} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="truncate" style={{ fontSize: 13, fontWeight: 600 }}>
                {currentUser?.full_name ?? 'Loading...'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Trust: {currentUser?.trust_score ?? 0}
                {currentUser?.role && currentUser.role !== 'member' && ` · ${currentUser.role}`}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
