import axiosClient from '../api/axiosClient'

const normalizeCohortPayload = (payload) => ({
  ...payload,
  startDate: payload.startDate
    ? new Date(payload.startDate).toISOString()
    : payload.startDate,
  endDate: payload.endDate
    ? new Date(payload.endDate).toISOString()
    : payload.endDate,
})

export const getAdminCohorts = async (params = {}) => {
  const { data } = await axiosClient.get('/admin/cohorts', { params })
  return data
}

export const createAdminCohort = async (payload) => {
  const { data } = await axiosClient.post(
    '/admin/cohorts',
    normalizeCohortPayload(payload),
  )
  return data
}

export const getAdminCohort = async (cohortId) => {
  const { data } = await axiosClient.get(`/admin/cohorts/${cohortId}`)
  return data
}

export const updateAdminCohort = async (cohortId, payload) => {
  const { data } = await axiosClient.patch(
    `/admin/cohorts/${cohortId}`,
    normalizeCohortPayload(payload),
  )
  return data
}

export const archiveAdminCohort = async (cohortId) => {
  const { data } = await axiosClient.delete(`/admin/cohorts/${cohortId}`)
  return data
}

export const updateAdminCohortFellows = async (cohortId, fellowIds) => {
  const { data } = await axiosClient.patch(`/admin/cohorts/${cohortId}/fellows`, {
    fellowIds,
  })
  return data
}

export const getAdminCohortStats = async () => {
  const { data } = await axiosClient.get('/admin/cohort-stats')
  return data
}

export const getMyCohort = async () => {
  const { data } = await axiosClient.get('/fellow/my-cohort')
  return data
}
