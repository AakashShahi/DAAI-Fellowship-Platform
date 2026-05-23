import axiosClient from '../api/axiosClient'

export const getMyLearningProgress = async () => {
  const response = await axiosClient.get('/learning-progress/me')
  return response.data
}

export const getMyLearningProgressByTrack = async (learningTrack) => {
  const response = await axiosClient.get(`/learning-progress/me/${learningTrack}`)
  return response.data
}

export const updateMyLearningProgress = async (payload) => {
  const response = await axiosClient.put('/learning-progress/me', payload)
  return response.data
}
