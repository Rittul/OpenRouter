import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Landingpage from './components/Landingpage'
import Sidebar from './components/Sidebar'

function App() {

  return (
    <Routes>
      <Route path="/" element={<Landingpage/>} />
      <Route path="/Auth" element={<Landingpage showAuthModal />} />
      <Route path="/home" element={<Sidebar/>} />
    </Routes>
  )
}

export default App
