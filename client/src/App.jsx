import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './stores/authStore'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ApplicationPage from './pages/ApplicationPage'
import StatusPage from './pages/StatusPage'
import PrivateRoute from './components/PrivateRoute'
import { isTokenValid } from './stores/authStore'

function App() {
  const token = useAuthStore((state) => state.token)
  const isAuthenticated = isTokenValid(token)

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/application/:id"
            element={
              <PrivateRoute>
                <ApplicationPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/status/:status"
            element={
              <PrivateRoute>
                <StatusPage />
              </PrivateRoute>
            }
          />
          <Route
            path="*"
            element={
              <Navigate
                to={isAuthenticated ? '/dashboard' : '/login'}
                replace
              />
            }
          />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </>
  )
}

export default App
