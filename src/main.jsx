import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/main.scss'   // ← PRIMERO los estilos globales
import App from './App.jsx'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
dayjs.locale('es')            // ← Fechas en español globalmente

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
