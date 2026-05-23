import { create } from 'zustand'
import { authStorage } from '../lib/authStorage'

const storedToken = authStorage.getToken()
const storedUser = authStorage.getUser()

const useAuthStore = create((set) => ({
  token: storedToken,
  user: storedUser,
  isAuthenticated: Boolean(storedToken),

  setAuth: ({ token, user, refreshToken }) => {
    authStorage.setToken(token)
    authStorage.setRefreshToken(refreshToken)
    authStorage.setUser(user)

    set({
      token,
      user,
      isAuthenticated: Boolean(token),
    })
  },

  updateUser: (updates) => {
    set((state) => {
      const updatedUser = {
        ...state.user,
        ...updates,
      }

      authStorage.setUser(updatedUser)

      return {
        user: updatedUser,
      }
    })
  },

  logout: () => {
    authStorage.clear()
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    })
  },
}))

export default useAuthStore
