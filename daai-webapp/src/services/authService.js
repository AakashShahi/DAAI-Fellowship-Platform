import axiosClient from '../api/axiosClient'

export const loginUser = async (payload) => {
  const response = await axiosClient.post('/auth/login', payload)
  return response.data
}
