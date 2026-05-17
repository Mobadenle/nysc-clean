import { Routes, Route, Navigate } from 'react-router-dom'

import DashboardHome      from '../pages/dashboard/DashboardHome'
import IssueFeedPage      from '../pages/dashboard/IssueFeedPage'
import IssueDetailPage    from '../pages/dashboard/IssueDetailPage'
import SearchPage         from '../pages/dashboard/SearchPage'
import PostIssuePage      from '../pages/dashboard/PostIssuePage'
import MyIssuesPage       from '../pages/dashboard/MyIssuesPage'
import SavedIssuesPage    from '../pages/dashboard/SavedIssuesPage'
import NotificationsPage  from '../pages/dashboard/NotificationsPage'
import ProfilePage        from '../pages/dashboard/ProfilePage'
import AmbassadorDashboard from '../pages/ambassador/AmbassadorDashboard'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/dashboard"     element={<DashboardHome />} />
      <Route path="/feed"          element={<IssueFeedPage />} />
      <Route path="/issue/:id"     element={<IssueDetailPage />} />
      <Route path="/search"        element={<SearchPage />} />
      <Route path="/post-issue"    element={<PostIssuePage />} />
      <Route path="/my-issues"     element={<MyIssuesPage />} />
      <Route path="/saved"         element={<SavedIssuesPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/profile"       element={<ProfilePage />} />
      <Route path="/ambassador"    element={<AmbassadorDashboard />} />
      <Route path="*"              element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
