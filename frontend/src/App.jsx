import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Landingpage from './components/Landingpage'
import Sidebar from './components/Sidebar'
import Apikey from './components/Apikey'
import Credits from './components/Credits'
import Chat from './components/Chat'

// Persistent layout: Sidebar always visible on the left
const DashboardLayout = () => {
  const location = useLocation()

  // Derive the active nav key from the current path
  const activeKey =
    location.pathname === '/apikey'   ? 'keys'    :
    location.pathname === '/credits'  ? 'credits' :
    location.pathname === '/chats'     ? 'chat'    : 'chat';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar active={activeKey} />
      <main style={{ flex: 1, overflow: 'auto' }}>
        <Routes>
          <Route path="/apikey"   element={<Apikey />} />
          <Route path="/credits"  element={<Credits />} />
          <Route path="/chats"  element={<Chat />} />
          <Route path="/chat/:id" element={<Chat />} />
          {/* default: redirect to apikey */}
          <Route path="*" element={<Navigate to="/apikey" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/"     element={<Landingpage />} />
      <Route path="/Auth" element={<Landingpage showAuthModal />} />

      {/* Protected dashboard — sidebar always rendered here */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
