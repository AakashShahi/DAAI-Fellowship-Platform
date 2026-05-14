import axiosClient from '../api/axiosClient'

export const getSubmissionsStaff = async (params = {}) => {
  const { data } = await axiosClient.get('/submissions', { params })
  return data
}

export const getSubmissionStaff = async (submissionId) => {
  const { data } = await axiosClient.get(`/submissions/${submissionId}`)
  return data
}

export const reviewSubmission = async (submissionId, payload) => {
  const { data } = await axiosClient.patch(
    `/submissions/${submissionId}/review`,
    payload,
  )
  return data
}

export const getFellowMySubmissions = async () => {
  const { data } = await axiosClient.get('/learning/me/submissions')
  return data
}
