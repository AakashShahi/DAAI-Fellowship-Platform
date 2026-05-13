import { create } from 'zustand'

const storedToken = localStorage.getItem('token')
const storedUser = localStorage.getItem('user')

const parseStoredUser = () => {
  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser)
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

const useAuthStore = create((set) => ({
  token: storedToken,
  user: parseStoredUser(),
  isAuthenticated: Boolean(storedToken),

  setAuth: ({ token, user }) => {
    localStorage.setItem('token', token)

    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }

    set({
      token,
      user,
      isAuthenticated: Boolean(token),
    })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    })
  },
}))

export default useAuthStore
