import { useState } from 'react'
import { registerUser } from '../services/authService'

const getRegisterErrorMessage = (error) => {
  const detail = error?.response?.data?.detail

  if (typeof detail === 'string') {
    return detail
  }

  if (Array.isArray(detail) && detail.length > 0) {
    return detail[0]?.msg ?? 'Registration failed. Please check your details.'
  }

  return error?.message ?? 'Registration failed. Please check your details.'
}

export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const register = async (payload) => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const data = await registerUser(payload)
      setSuccess('Registration successful. Redirecting to login...')
      return data
    } catch (registerError) {
      setError(getRegisterErrorMessage(registerError))
      throw registerError
    } finally {
      setIsLoading(false)
    }
  }

  return {
    register,
    error,
    success,
    isLoading,
  }
}
