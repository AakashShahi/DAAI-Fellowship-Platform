import axiosClient from '../api/axiosClient'

export const getAnnouncementsAdmin = async () => {
  const { data } = await axiosClient.get('/admin/announcements')
  return data
}

export const createAnnouncement = async (payload) => {
  const { data } = await axiosClient.post('/admin/announcements', payload)
  return data
}

export const deleteAnnouncement = async (id) => {
  const { data } = await axiosClient.delete(`/admin/announcements/${id}`)
  return data
}
