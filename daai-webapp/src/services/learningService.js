import axiosClient from '../api/axiosClient'

export const getModulesAdmin = async (track = '', status = '') => {
  if (track && /^[a-f0-9]{24}$/i.test(track)) {
    const { data } = await axiosClient.get('/modules', {
      params: { trackId: track },
    })
    return data
  }

  const params = {
    ...(track ? { track } : {}),
    ...(status ? { status } : {}),
  }
  const { data } = await axiosClient.get('/admin/modules', { params })
  return data
}

export const createModule = async (payload) => {
  if (payload.trackId && !payload.track) {
    const { data } = await axiosClient.post('/modules', payload)
    return data
  }
  const { data } = await axiosClient.post('/admin/modules', payload)
  return data
}

export const getModuleAdmin = async (moduleId) => {
  const { data } = await axiosClient.get(`/admin/modules/${moduleId}`)
  return data
}

export const updateModule = async (moduleId, payload) => {
  if (payload.trackId && !payload.track) {
    const { data } = await axiosClient.patch(`/modules/${moduleId}`, payload)
    return data
  }
  const { data } = await axiosClient.patch(`/admin/modules/${moduleId}`, payload)
  return data
}

export const deleteModule = async (moduleId) => {
  await axiosClient.delete(`/admin/modules/${moduleId}`)
}

export const getLessonsAdmin = async (params = {}) => {
  if (!params.moduleId) {
    return []
  }
  const module = await getModuleAdmin(params.moduleId)
  return module.lessons ?? []
}

export const createLesson = async (moduleIdOrPayload, maybePayload) => {
  const moduleId = maybePayload ? moduleIdOrPayload : moduleIdOrPayload.moduleId
  const payload = maybePayload ?? moduleIdOrPayload
  const { data } = await axiosClient.post(
    `/admin/modules/${moduleId}/lessons`,
    payload,
  )
  return data
}

export const updateLesson = async (moduleIdOrLessonId, lessonIdOrPayload, maybePayload) => {
  const moduleId = maybePayload ? moduleIdOrLessonId : lessonIdOrPayload.moduleId
  const lessonId = maybePayload ? lessonIdOrPayload : moduleIdOrLessonId
  const payload = maybePayload ?? lessonIdOrPayload
  const { data } = await axiosClient.patch(
    `/admin/modules/${moduleId}/lessons/${lessonId}`,
    payload,
  )
  return data
}

export const deleteLesson = async (moduleIdOrLessonId, maybeLessonId) => {
  if (!maybeLessonId) {
    await axiosClient.delete(`/lessons/${moduleIdOrLessonId}`)
    return
  }
  const moduleId = moduleIdOrLessonId
  const lessonId = maybeLessonId
  await axiosClient.delete(`/admin/modules/${moduleId}/lessons/${lessonId}`)
}

export const getCurriculumStats = async () => {
  const { data } = await axiosClient.get('/admin/curriculum-stats')
  return data
}

export const getFellowLearningModules = async () => {
  const { data } = await axiosClient.get('/fellow/modules')
  return data
}

export const getFellowLearningSummary = async () => {
  const { data } = await axiosClient.get('/fellow/progress')
  return data
}

export const getFellowModuleDetail = async (moduleId) => {
  const { data } = await axiosClient.get(`/fellow/modules/${moduleId}`)
  return data
}

export const getFellowLessonDetail = async (moduleId, lessonId) => {
  const { data } = await axiosClient.get(
    `/fellow/modules/${moduleId}/lessons/${lessonId}`,
  )
  return data
}

export const updateFellowLessonProgress = async (moduleId, lessonId, status) => {
  const { data } = await axiosClient.post(
    `/fellow/modules/${moduleId}/lessons/${lessonId}/progress`,
    { status },
  )
  return data
}

export const completeFellowLesson = async (moduleId, lessonId) =>
  updateFellowLessonProgress(moduleId, lessonId, 'completed')
