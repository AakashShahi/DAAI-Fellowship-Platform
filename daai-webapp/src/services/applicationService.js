import axiosClient from '../api/axiosClient'

export const submitApplication = async (payload) => {
  if (payload.document) {
    const formData = new FormData()
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value)
      }
    })

    const response = await axiosClient.post('/applications', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  }

  const response = await axiosClient.post('/applications', payload)
  return response.data
}

export const getApplications = async () => {
  const response = await axiosClient.get('/applications/admin')
  return response.data
}

export const getApplication = async (applicationId) => {
  const response = await axiosClient.get(`/applications/admin/${applicationId}`)
  return response.data
}

export const updateApplicationStatus = async (applicationId, status) => {
  const response = await axiosClient.patch(
    `/applications/admin/${applicationId}/status`,
    { status },
  )
  return response.data
}
