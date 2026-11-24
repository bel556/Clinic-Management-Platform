import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import { ErrorBoundary, ToastProvider } from './components/common'
import { SessionProvider } from './services/session'

export default function App() {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </SessionProvider>
    </ErrorBoundary>
  )
}
