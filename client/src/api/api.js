import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

const api = axios.create({
  baseURL: API_URL
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('maxapp-auth')

  // zustand/persist stores the entire object under the key; extract token if present.
  let authToken = token
  try {
    const parsed = token ? JSON.parse(token) : null
    if (parsed?.state?.token) {
      authToken = parsed.state.token
    }
  } catch {
    // ignore
  }

  if (authToken) {
    if (!config.headers) config.headers = {}
    config.headers.Authorization = `Bearer ${authToken}`
  }

  return config
})

export default api
