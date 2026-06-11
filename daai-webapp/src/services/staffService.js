import axiosClient from '../api/axiosClient'

export const getStaffList = async ({
  role = '',
  status = '',
  search = '',
  page = 1,
  pageSize = 10,
} = {}) => {
  const params = { page, page_size: pageSize }

  if (role) params.role = role
  if (status) params.status = status
  if (search) params.search = search

  const { data } = await axiosClient.get('/admin/staff', { params })
  return data
}

export const getStaffDetail = async (staffId) => {
  const { data } = await axiosClient.get(`/admin/staff/${staffId}`)
  return data
}

export const createStaff = async (payload) => {
  const { data } = await axiosClient.post('/admin/staff', payload)
  return data
}

export const updateStaff = async (staffId, payload) => {
  const { data } = await axiosClient.put(`/admin/staff/${staffId}`, payload)
  return data
}

export const toggleStaffStatus = async (staffId, isActive) => {
  const { data } = await axiosClient.patch(`/admin/staff/${staffId}/status`, {
    is_active: isActive,
  })
  return data
}

export const getStaffActivityLogs = async (staffId, { skip = 0, limit = 50 } = {}) => {
  const { data } = await axiosClient.get(`/admin/staff/${staffId}/activity-logs`, {
    params: { skip, limit },
  })
  return data
}

export const getAllowedRoles = async () => {
  const { data } = await axiosClient.get('/admin/staff/allowed-roles')
  return data
}
