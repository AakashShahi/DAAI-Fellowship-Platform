import axiosClient from '../api/axiosClient'

export const getAssignmentsAdmin = async (params = {}) => {
  const { data } = await axiosClient.get('/assignments', { params })
  return data
}

export const getAssignmentAdmin = async (assignmentId) => {
  const { data } = await axiosClient.get(`/assignments/${assignmentId}`)
  return data
}

export const createAssignment = async (payload) => {
  const { data } = await axiosClient.post('/assignments', payload)
  return data
}

export const updateAssignment = async (assignmentId, payload) => {
  const { data } = await axiosClient.patch(`/assignments/${assignmentId}`, payload)
  return data
}

export const deleteAssignment = async (assignmentId) => {
  await axiosClient.delete(`/assignments/${assignmentId}`)
}

export const getFellowAssignmentsSummary = async () => {
  const { data } = await axiosClient.get('/learning/me/assignments/summary')
  return data
}

export const getFellowAssignments = async () => {
  const { data } = await axiosClient.get('/learning/me/assignments')
  return data
}

export const getFellowAssignment = async (assignmentId) => {
  const { data } = await axiosClient.get(`/learning/me/assignments/${assignmentId}`)
  return data
}

export const submitFellowAssignment = async (assignmentId, payload) => {
  const { data } = await axiosClient.post(
    `/learning/me/assignments/${assignmentId}/submission`,
    payload,
  )
  return data
}
