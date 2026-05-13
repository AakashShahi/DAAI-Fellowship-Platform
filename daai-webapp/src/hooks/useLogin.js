import { useState } from 'react'
import { loginUser } from '../services/authService'
import useAuthStore from '../store/authStore'

const getLoginErrorMessage = (error) => {
  const detail = error?.response?.data?.detail

  if (typeof detail === 'string') {
    return detail
  }

  if (Array.isArray(detail) && detail.length > 0) {
    return detail[0]?.msg ?? 'Login failed. Please check your credentials.'
  }

  return error?.message ?? 'Login failed. Please check your credentials.'
}

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const login = async (credentials) => {
    setIsLoading(true)
    setError('')

    try {
      const data = await loginUser(credentials)
      const token = data.access_token

      if (!token) {
        throw new Error('Login response did not include an access token.')
      }

      localStorage.setItem('token', token)
      setAuth({ token, user: data.user ?? null })

      return data
    } catch (loginError) {
      const message = getLoginErrorMessage(loginError)
      setError(message)
      throw loginError
    } finally {
      setIsLoading(false)
    }
  }

  return {
    login,
    error,
    isLoading,
  }
}
