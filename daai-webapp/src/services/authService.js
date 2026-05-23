import axiosClient from '../api/axiosClient'

export const loginUser = async (payload) => {
  const response = await axiosClient.post('/auth/login', payload)
  return response.data
}

export const registerUser = async (payload) => {
  const response = await axiosClient.post('/auth/register', payload)
  return response.data
}

export const requestPasswordReset = async (payload) => {
  const response = await axiosClient.post('/auth/forgot-password', payload)
  return response.data
}

export const resetPassword = async (payload) => {
  const response = await axiosClient.post('/auth/reset-password', payload)
  return response.data
}
