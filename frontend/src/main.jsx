import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import './index.css'
import App from './App.jsx'

import { ProfileProvider }from './context/Profilcontext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>

    <ProfileProvider>

      <BrowserRouter>
        <App />
      </BrowserRouter>

    </ProfileProvider>

  </StrictMode>,
)