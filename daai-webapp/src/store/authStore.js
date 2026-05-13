import { create } from 'zustand'

const storedToken = localStorage.getItem('token')

const useAuthStore = create((set) => ({
  token: storedToken,
  user: null,
  isAuthenticated: Boolean(storedToken),

  setAuth: ({ token, user }) =>
    set({
      token,
      user,
      isAuthenticated: Boolean(token),
    }),

  logout: () => {
    localStorage.removeItem('token')
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    })
  },
}))

export default useAuthStore
