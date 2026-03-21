import { Link, useNavigate } from 'react-router'
import { LogOut } from 'lucide-react'
import useAuthStore from '../stores/authStore'

export default function Header({ title }) {
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="w-full border-b border-base-200 bg-base-100">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <span className="text-primary">✨</span>
          <span>MaxApp</span>
        </Link>

        <div className="flex items-center gap-4">
          {title && <h1 className="text-sm font-semibold text-base-content/70">{title}</h1>}
          <button
            type="button"
            className="btn btn-ghost btn-sm gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
