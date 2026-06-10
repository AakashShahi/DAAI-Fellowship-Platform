import axiosClient from '../api/axiosClient'

export const getFellowMe = async () => {
  const response = await axiosClient.get('/fellow/me')
  return response.data
}

export const selectFellowTrack = async (selectedTrack) => {
  const response = await axiosClient.post('/fellow/select-track', {
    selectedTrack,
  })
  return response.data
}
