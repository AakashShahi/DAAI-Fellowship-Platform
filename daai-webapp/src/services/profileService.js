import axiosClient from '../api/axiosClient'

export const getMyProfile = async () => {
  const response = await axiosClient.get('/profile/me')
  return response.data
}

export const updateMyProfile = async (payload) => {
  const response = await axiosClient.put('/profile/me', payload)
  return response.data
}

export const changeMyPassword = async (payload) => {
  const response = await axiosClient.put('/profile/change-password', payload)
  return response.data
}
