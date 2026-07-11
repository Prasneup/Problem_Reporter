import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

try {
  const stored = localStorage.getItem('dang-smart-city-store');
  if (stored && stored.length > 300000) { // If larger than ~300KB
    localStorage.removeItem('dang-smart-city-store');
    console.log('Cleared bloated local storage cache to restore performance.');
  }
} catch (e) {
  console.error('Local storage validation failed:', e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
