import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SiteProvider } from './context/SiteContext'
import ErrorBoundary from './components/ErrorBoundary'
import DenickLayout from './components/DenickLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PlaceholderPage from './pages/PlaceholderPage'
import ProjectTracker from './pages/projects/ProjectTracker'
import UserManagement from './pages/manage/UserManagement'
import LoginHistory from './pages/manage/LoginHistory'
import AdminPermissions from './pages/manage/AdminPermissions'
import DatabaseManager from './pages/manage/DatabaseManager'
import SocialMediaManager from './pages/social/SocialMediaManager'
import SocialPostsManager from './pages/social/SocialPostsManager'
import SocialCalendar from './pages/social/SocialCalendar'
import SocialAnalytics from './pages/social/SocialAnalytics'
import ContentManager from './pages/content/ContentManager'
import AffiliateManager from './pages/content/AffiliateManager'
import SeoResearch from './pages/seo/SeoResearch'
import SeoAuditChecklist from './pages/seo/SeoAuditChecklist'
import AnalyticsDashboard from './pages/analytics/AnalyticsDashboard'
import DataMigration from './pages/manage/DataMigration'
import SiteSettings from './pages/manage/SiteSettings'
import PPLeagues from './pages/pp/PPLeagues'
import PPTeams from './pages/pp/PPTeams'
import PPMatches from './pages/pp/PPMatches'
import PPArticles from './pages/pp/PPArticles'
import { useSite } from './context/SiteContext'

function AppContent() {
  const { currentUser, logout } = useAuth()
  const { loadSites } = useSite()

  // Load sites once user is authenticated
  useEffect(() => {
    if (currentUser) loadSites()
  }, [currentUser, loadSites])

  if (!currentUser) return <LoginPage />

  if (currentUser.role !== 'admin') {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔒 Admin Access Required</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>This portal is restricted to administrators.</p>
        <button className="btn-save" onClick={logout}>Sign Out</button>
      </div>
    )
  }

  return (
    <DenickLayout
      topbarRight={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#1e293b' }}>{currentUser.name}</span>
          <span className="badge" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>admin</span>
          <button onClick={logout} style={{ fontSize: '0.78rem', background: 'none', border: '1px solid #e2e8f0', borderRadius: 'var(--radius)', padding: '0.25rem 0.6rem', cursor: 'pointer', color: '#64748b' }}>Sign Out</button>
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        {/* Phase 2 */}
        <Route path="/projects" element={<ProjectTracker />} />
        {/* Phase 3 — Content */}
        <Route path="/content/announcements" element={<ContentManager />} />
        <Route path="/content/tips" element={<ContentManager />} />
        <Route path="/content/affiliates" element={<AffiliateManager />} />
        {/* Phase 3 — Social */}
        <Route path="/social/accounts" element={<SocialMediaManager />} />
        <Route path="/social/posts" element={<SocialPostsManager />} />
        <Route path="/social/calendar" element={<SocialCalendar />} />
        <Route path="/social/analytics" element={<SocialAnalytics />} />
        {/* Phase 4 — SEO & Analytics */}
        <Route path="/seo/research" element={<SeoResearch />} />
        <Route path="/seo/audit" element={<SeoAuditChecklist />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        {/* Pitch Passport */}
        <Route path="/pp/leagues" element={<PPLeagues />} />
        <Route path="/pp/teams" element={<PPTeams />} />
        <Route path="/pp/matches" element={<PPMatches />} />
        <Route path="/pp/articles" element={<PPArticles />} />
        {/* Site Management */}
        <Route path="/manage/data-migration" element={<DataMigration />} />
        <Route path="/manage/sites" element={<SiteSettings />} />
        {/* Phase 2 */}
        <Route path="/manage/users" element={<UserManagement />} />
        <Route path="/manage/databases" element={<DatabaseManager />} />
        <Route path="/manage/login-history" element={<LoginHistory />} />
        <Route path="/manage/permissions" element={<AdminPermissions />} />
        {/* 404 */}
        <Route path="*" element={
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <h1 style={{ fontSize: '3rem', color: 'var(--blue)' }}>404</h1>
            <p style={{ color: 'var(--text-muted)' }}>Page not found</p>
          </div>
        } />
      </Routes>
    </DenickLayout>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <SiteProvider>
            <ToastProvider>
              <ErrorBoundary>
                <AppContent />
              </ErrorBoundary>
            </ToastProvider>
          </SiteProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
