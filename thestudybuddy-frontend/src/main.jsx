import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './firebase/AuthContext.jsx'
import { SubjectProvider } from './contexts/SubjectContext.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SubjectProvider>
          <App />
        </SubjectProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)