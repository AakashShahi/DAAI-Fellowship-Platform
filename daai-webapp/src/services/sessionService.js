import axiosClient from '../api/axiosClient'

const normalizeSessionPayload = (payload) => ({
  ...payload,
  sessionDate: payload.sessionDate
    ? new Date(payload.sessionDate).toISOString()
    : payload.sessionDate,
})

export const getAdminSessions = async (params = {}) => {
  const { data } = await axiosClient.get('/admin/sessions', { params })
  return data
}

export const createAdminSession = async (payload) => {
  const { data } = await axiosClient.post('/admin/sessions', normalizeSessionPayload(payload))
  return data
}

export const getAdminSession = async (sessionId) => {
  const { data } = await axiosClient.get(`/admin/sessions/${sessionId}`)
  return data
}

export const updateAdminSession = async (sessionId, payload) => {
  const { data } = await axiosClient.patch(`/admin/sessions/${sessionId}`, normalizeSessionPayload(payload))
  return data
}

export const archiveAdminSession = async (sessionId) => {
  const { data } = await axiosClient.delete(`/admin/sessions/${sessionId}`)
  return data
}

export const getAdminSessionAttendance = async (sessionId) => {
  const { data } = await axiosClient.get(`/admin/sessions/${sessionId}/attendance`)
  return data
}

export const updateAdminSessionAttendance = async (sessionId, attendance) => {
  const { data } = await axiosClient.patch(`/admin/sessions/${sessionId}/attendance`, { attendance })
  return data
}

export const getAdminSessionStats = async () => {
  const { data } = await axiosClient.get('/admin/session-stats')
  return data
}

export const getFellowSessions = async () => {
  const { data } = await axiosClient.get('/fellow/sessions')
  return data
}

export const getFellowSession = async (sessionId) => {
  const { data } = await axiosClient.get(`/fellow/sessions/${sessionId}`)
  return data
}

export const getFellowAttendance = async () => {
  const { data } = await axiosClient.get('/fellow/attendance')
  return data
}

export const getFellowAttendanceSummary = async () => {
  const { data } = await axiosClient.get('/fellow/attendance-summary')
  return data
}
