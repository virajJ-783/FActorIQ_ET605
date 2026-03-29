import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useStore from './store/useStore'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ChapterPage from './pages/ChapterPage'
import Analytics from './pages/Analytics'
import Leaderboard from './pages/Leaderboard'
import Games from './pages/Games'

function PrivateRoute({ children }) {
  const isLoggedIn = useStore((s) => s.isLoggedIn)
  return isLoggedIn ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/learn"     element={<PrivateRoute><ChapterPage /></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
        <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
        <Route path="/games"     element={<PrivateRoute><Games /></PrivateRoute>} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
