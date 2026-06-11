import axiosClient from '../api/axiosClient'

export const getAdminDashboard = async () => {
  const { data } = await axiosClient.get('/dashboard/admin')
  return data
}

export const getHrDashboard = async () => {
  const { data } = await axiosClient.get('/dashboard/hr')
  return data
}

export const getInstructorDashboard = async () => {
  const { data } = await axiosClient.get('/dashboard/instructor')
  return data
}

export const getFellowDashboard = async () => {
  const { data } = await axiosClient.get('/dashboard/fellow')
  return data
}
