import { createRoot } from 'react-dom/client'
import './styles/base.css'
import App from './App.jsx'

// StrictMode double-invokes effects in development, which doubles every API
// request. With a remote database that makes dev pages ~2x slower, so it is
// intentionally omitted here.
createRoot(document.getElementById('root')).render(<App />)
