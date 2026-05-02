import { createContext, useContext, useState } from 'react'
import { API_BASE } from '../config/api'

const AuthContext = createContext(null)
const SESSION_KEY = 'cs_session'
const TOKEN_KEY = 'cs_token'
const API = `${API_BASE}/api/auth`

function loadSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) ?? null }
  catch { return null }
}

export function authFetch(url, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY)
  const headers = { ...(options.headers ?? {}) }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return fetch(url, { ...options, headers }).then(res => {
    if (res.status === 401 && token) {
      localStorage.removeItem(SESSION_KEY)
      localStorage.removeItem(TOKEN_KEY)
      window.location.reload()
    }
    return res
  })
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(loadSession)
  const [users, setUsers] = useState([])

  function saveSession(user, token) {
    const { token: _drop, ...userWithoutToken } = user
    setCurrentUser(userWithoutToken)
    localStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutToken))
    if (token) localStorage.setItem(TOKEN_KEY, token)
  }

  async function login(email, password) {
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) return { error: data.error }
      saveSession(data, data.token)
      return { success: true }
    } catch {
      return { error: 'Cannot connect to server' }
    }
  }

  function logout() {
    setCurrentUser(null)
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(TOKEN_KEY)
  }

  async function loadUsers() {
    try {
      const res = await authFetch(`${API}/users`)
      const data = await res.json()
      setUsers(data)
      return data
    } catch { return [] }
  }

  async function addUser(user) {
    await authFetch(`${API}/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(user) })
    await loadUsers()
  }

  async function updateUser(id, changes) {
    await authFetch(`${API}/users/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(changes) })
    if (currentUser?.id === id) {
      const updated = { ...currentUser, ...changes }
      saveSession(updated, localStorage.getItem(TOKEN_KEY))
    }
    await loadUsers()
  }

  async function removeUser(id) {
    await authFetch(`${API}/users/${id}`, { method: 'DELETE' })
    await loadUsers()
  }

  return (
    <AuthContext.Provider value={{ currentUser, users, login, logout, loadUsers, addUser, updateUser, removeUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
