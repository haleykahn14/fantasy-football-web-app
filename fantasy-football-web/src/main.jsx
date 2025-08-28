import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { WeekProvider } from './WeekContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WeekProvider>
      <App />
    </WeekProvider>
  </StrictMode>,
)
