import axiosClient from '../api/axiosClient'

export const getAdminFellows = async (track = '') => {
  const params = track ? { track } : {}
  const { data } = await axiosClient.get('/admin/fellows', { params })
  return data
}

export const getAdminFellowProfile = async (fellowId) => {
  const { data } = await axiosClient.get(`/admin/fellows/${fellowId}`)
  return data
}

export const updateAdminFellowTrack = async (fellowId, selectedTrack) => {
  const { data } = await axiosClient.patch(`/admin/fellows/${fellowId}/track`, {
    selectedTrack,
  })
  return data
}

export const getAdminTrackStats = async () => {
  const { data } = await axiosClient.get('/admin/track-stats')
  return data
}
