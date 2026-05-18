import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Landingpage from './components/Landingpage'

function App() {

  return (
    <Routes>
      <Route path="/" element={<Landingpage/>} />
    </Routes>
  )
}

export default App
