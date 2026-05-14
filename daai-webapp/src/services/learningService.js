import axiosClient from '../api/axiosClient'

export const getModulesAdmin = async (trackId) => {
  const params = trackId ? { trackId } : {}
  const { data } = await axiosClient.get('/modules', { params })
  return data
}

export const createModule = async (payload) => {
  const { data } = await axiosClient.post('/modules', payload)
  return data
}

export const updateModule = async (moduleId, payload) => {
  const { data } = await axiosClient.patch(`/modules/${moduleId}`, payload)
  return data
}

export const deleteModule = async (moduleId) => {
  await axiosClient.delete(`/modules/${moduleId}`)
}

export const getLessonsAdmin = async (params = {}) => {
  const { data } = await axiosClient.get('/lessons', { params })
  return data
}

export const createLesson = async (payload) => {
  const { data } = await axiosClient.post('/lessons', payload)
  return data
}

export const updateLesson = async (lessonId, payload) => {
  const { data } = await axiosClient.patch(`/lessons/${lessonId}`, payload)
  return data
}

export const deleteLesson = async (lessonId) => {
  await axiosClient.delete(`/lessons/${lessonId}`)
}

export const getFellowLearningModules = async () => {
  const { data } = await axiosClient.get('/learning/me/modules')
  return data
}

export const getFellowLearningSummary = async () => {
  const { data } = await axiosClient.get('/learning/me/summary')
  return data
}

export const getFellowModuleDetail = async (moduleId) => {
  const { data } = await axiosClient.get(`/learning/me/modules/${moduleId}`)
  return data
}

export const getFellowLessonDetail = async (lessonId) => {
  const { data } = await axiosClient.get(`/learning/me/lessons/${lessonId}`)
  return data
}

export const completeFellowLesson = async (lessonId) => {
  const { data } = await axiosClient.post(`/learning/me/lessons/${lessonId}/complete`)
  return data
}
