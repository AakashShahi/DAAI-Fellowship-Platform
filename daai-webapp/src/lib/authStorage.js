const AUTH_TOKEN_KEY = 'token'
const AUTH_USER_KEY = 'user'
const AUTH_REFRESH_TOKEN_KEY = 'refresh_token'
const AUTH_ROLE_KEY = 'role'

const getStorage = () => {
  if (typeof window === 'undefined') {
    return null
  }

  return window.sessionStorage
}

export const authStorage = {
  getToken() {
    return getStorage()?.getItem(AUTH_TOKEN_KEY) ?? null
  },

  setToken(token) {
    const storage = getStorage()
    if (!storage) return

    if (token) {
      storage.setItem(AUTH_TOKEN_KEY, token)
    } else {
      storage.removeItem(AUTH_TOKEN_KEY)
    }
  },

  getRefreshToken() {
    return getStorage()?.getItem(AUTH_REFRESH_TOKEN_KEY) ?? null
  },

  setRefreshToken(refreshToken) {
    const storage = getStorage()
    if (!storage) return

    if (refreshToken) {
      storage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken)
    } else {
      storage.removeItem(AUTH_REFRESH_TOKEN_KEY)
    }
  },

  getUser() {
    const storage = getStorage()
    const storedUser = storage?.getItem(AUTH_USER_KEY)

    if (!storedUser) {
      return null
    }

    try {
      return JSON.parse(storedUser)
    } catch {
      storage.removeItem(AUTH_USER_KEY)
      return null
    }
  },

  setUser(user) {
    const storage = getStorage()
    if (!storage) return

    if (user) {
      storage.setItem(AUTH_USER_KEY, JSON.stringify(user))
      if (user.role) {
        storage.setItem(AUTH_ROLE_KEY, user.role)
      }
    } else {
      storage.removeItem(AUTH_USER_KEY)
      storage.removeItem(AUTH_ROLE_KEY)
    }
  },

  clear() {
    const storage = getStorage()
    if (!storage) return

    storage.removeItem(AUTH_TOKEN_KEY)
    storage.removeItem(AUTH_REFRESH_TOKEN_KEY)
    storage.removeItem(AUTH_USER_KEY)
    storage.removeItem(AUTH_ROLE_KEY)
  },
}
