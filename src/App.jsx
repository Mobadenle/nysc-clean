import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'

import { useAuth } from './context/AuthContext'
import { useApp }  from './context/AppContext'

import LandingPage from './pages/public/LandingPage'
import LoginPage   from './pages/public/LoginPage'
import SignupPage  from './pages/public/SignupPage'

import Sidebar        from './components/layout/Sidebar'
import Header         from './components/layout/Header'
import MobileHeader   from './components/layout/MobileHeader'
import AppRoutes      from './routes/AppRoutes'
import Toast          from './components/ui/Toast'
import LoadingSpinner from './components/ui/LoadingSpinner'

// ── Loading splash ────────────────────────────────────────────────────────────
function LoadingSplash() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: 'var(--bg)',
    }}>
      <div className="logo-mark" style={{ width: 52, height: 52, fontSize: 20, marginBottom: 20 }}>
        NH
      </div>
      <LoadingSpinner size={24} />
    </div>
  )
}

// ── Authenticated shell ───────────────────────────────────────────────────────
function AppShell() {
  const { toast, dismissToast } = useApp()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <MobileHeader onOpenSidebar={() => setSidebarOpen(true)} />
        <Header />
        <AppRoutes />
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={dismissToast} />}
    </div>
  )
}

// ── Public area ───────────────────────────────────────────────────────────────
// App.jsx owns which public page is showing via local state.
// AuthContext knows NOTHING about page routing.
function PublicArea() {
  const { toast, dismissToast } = useApp()
  const [view, setView] = useState('landing') // 'landing' | 'login' | 'signup'

  return (
    <>
      {view === 'landing' && (
        <LandingPage
          onLogin={()  => setView('login')}
          onSignup={() => setView('signup')}
        />
      )}
      {view === 'login' && (
        <LoginPage
          onGoSignup={() => setView('signup')}
          onGoLanding={() => setView('landing')}
        />
      )}
      {view === 'signup' && (
        <SignupPage
          onGoLogin={() => setView('login')}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={dismissToast} />}
    </>
  )
}

// ── Root — single auth gate ───────────────────────────────────────────────────
function Root() {
  const { isLoading, session } = useAuth()

  if (isLoading)   return <LoadingSplash />
  if (session)     return <AppShell />
  return <PublicArea />
}

// ── App entry ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  )
}
