import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const decodeJwtPayload = (token) => {
  const payload = token.split('.')[1]
  if (!payload) return null

  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')

  return JSON.parse(atob(padded))
}

export const isTokenValid = (token) => {
  if (!token || typeof token !== 'string') return false

  try {
    const payload = decodeJwtPayload(token)
    if (!payload) return false

    // Treat missing exp as invalid to avoid trusting malformed tokens.
    if (typeof payload.exp !== 'number') return false

    return payload.exp > Date.now() / 1000
  } catch {
    return false
  }
}

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,

      setToken: (token) => set({ token: isTokenValid(token) ? token : null }),

      login: (token) => {
        set({ token: isTokenValid(token) ? token : null })
      },

      logout: () => {
        set({ token: null })
      }
    }), {
    name: 'maxapp-auth',
      getStorage: () => localStorage,
      partialize: (state) => ({ token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (!state) return

        if (!isTokenValid(state.token)) {
          state.setToken(null)
        }
      }
  }
  )
)

export default useAuthStore
