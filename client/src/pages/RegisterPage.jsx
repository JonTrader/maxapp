import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import api from '../api/api'
import useAuthStore from '../stores/authStore'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      const { data } = await api.post('/auth/register', { name, email, password })
      login(data.token)
      toast.success('Account created!')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error(err)
      toast.error('Could not create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-base-200 bg-base-100 p-8 shadow-sm">
        <h1 className="text-center text-3xl font-semibold">MaxApp</h1>
        <p className="mt-2 text-center text-sm text-base-content/70">Create your account</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Full Name</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered"
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-control">
            <label className="label block">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-base-content/70">
          Already have an account?{' '}
          <Link className="link link-primary" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
