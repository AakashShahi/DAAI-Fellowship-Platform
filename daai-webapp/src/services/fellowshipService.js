import axiosClient from '../api/axiosClient'

export const getTracks = async () => {
  const { data } = await axiosClient.get('/tracks')
  return data
}

export const createTrack = async (payload) => {
  const { data } = await axiosClient.post('/tracks', payload)
  return data
}

export const updateTrack = async (trackId, payload) => {
  const { data } = await axiosClient.patch(`/tracks/${trackId}`, payload)
  return data
}

export const deleteTrack = async (trackId) => {
  await axiosClient.delete(`/tracks/${trackId}`)
}

export const getBatches = async (trackId) => {
  const params = trackId ? { trackId } : {}
  const { data } = await axiosClient.get('/batches', { params })
  return data
}

export const createBatch = async (payload) => {
  const { data } = await axiosClient.post('/batches', payload)
  return data
}

export const updateBatch = async (batchId, payload) => {
  const { data } = await axiosClient.patch(`/batches/${batchId}`, payload)
  return data
}

export const deleteBatch = async (batchId) => {
  await axiosClient.delete(`/batches/${batchId}`)
}

export const getFellowsForAdmin = async () => {
  const { data } = await axiosClient.get('/fellows')
  return data
}

export const getEnrollments = async (params = {}) => {
  const { data } = await axiosClient.get('/enrollments', { params })
  return data
}

export const createEnrollment = async (payload) => {
  const { data } = await axiosClient.post('/enrollments', payload)
  return data
}

export const updateEnrollment = async (enrollmentId, payload) => {
  const { data } = await axiosClient.patch(`/enrollments/${enrollmentId}`, payload)
  return data
}

export const getMyEnrollment = async () => {
  const { data } = await axiosClient.get('/enrollments/me')
  return data
}
