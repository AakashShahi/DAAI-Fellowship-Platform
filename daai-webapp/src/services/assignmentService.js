import axiosClient from '../api/axiosClient'

export const getAssignmentsAdmin = async (params = {}) => {
  const { data } = await axiosClient.get('/admin/assignments', { params })
  return data
}

export const getAssignmentAdmin = async (assignmentId) => {
  const { data } = await axiosClient.get(`/admin/assignments/${assignmentId}`)
  return data
}

export const createAssignment = async (payload) => {
  const { data } = await axiosClient.post('/admin/assignments', payload)
  return data
}

export const updateAssignment = async (assignmentId, payload) => {
  const { data } = await axiosClient.patch(`/admin/assignments/${assignmentId}`, payload)
  return data
}

export const deleteAssignment = async (assignmentId) => {
  await axiosClient.delete(`/admin/assignments/${assignmentId}`)
}

export const getAssignmentSubmissionsAdmin = async (assignmentId) => {
  const { data } = await axiosClient.get(
    `/admin/assignments/${assignmentId}/submissions`,
  )
  return data
}

export const reviewSubmissionAdmin = async (submissionId, payload) => {
  const { data } = await axiosClient.patch(
    `/admin/submissions/${submissionId}/review`,
    payload,
  )
  return data
}

export const getAssignmentStatsAdmin = async () => {
  const { data } = await axiosClient.get('/admin/assignment-stats')
  return data
}

export const getFellowAssignmentsSummary = async () => {
  const { data } = await axiosClient.get('/fellow/assignments/summary')
  return data
}

export const getFellowAssignments = async () => {
  const { data } = await axiosClient.get('/fellow/assignments')
  return data
}

export const getFellowAssignment = async (assignmentId) => {
  const { data } = await axiosClient.get(`/fellow/assignments/${assignmentId}`)
  return data
}

export const submitFellowAssignment = async (assignmentId, payload) => {
  const { data } = await axiosClient.post(
    `/fellow/assignments/${assignmentId}/submit`,
    payload,
  )
  return data
}

export const getFellowSubmissions = async () => {
  const { data } = await axiosClient.get('/fellow/submissions')
  return data
}
