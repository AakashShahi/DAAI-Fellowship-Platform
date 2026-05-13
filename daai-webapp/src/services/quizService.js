import axiosClient from '../api/axiosClient'

export const getQuizCategories = async () => {
  const response = await axiosClient.get('/quizzes/categories')
  return response.data
}

export const getQuizQuestions = async (category) => {
  const response = await axiosClient.get(`/quizzes/${category}/questions`)
  return response.data
}

export const submitQuiz = async (category, selectedAnswers) => {
  const response = await axiosClient.post(`/quizzes/${category}/submit`, {
    selected_answers: selectedAnswers,
  })
  return response.data
}

export const getMyQuizAttempts = async () => {
  const response = await axiosClient.get('/quizzes/my-attempts')
  return response.data
}

export const getMyQuizAttempt = async (attemptId) => {
  const response = await axiosClient.get(`/quizzes/my-attempts/${attemptId}`)
  return response.data
}

export const getAdminQuizQuestions = async () => {
  const response = await axiosClient.get('/quizzes/admin/questions')
  return response.data
}

export const createAdminQuizQuestion = async (question) => {
  const response = await axiosClient.post('/quizzes/admin/questions', question)
  return response.data
}

export const updateAdminQuizQuestion = async (questionId, question) => {
  const response = await axiosClient.put(
    `/quizzes/admin/questions/${questionId}`,
    question,
  )
  return response.data
}

export const updateAdminQuizQuestionStatus = async (questionId, isActive) => {
  const response = await axiosClient.patch(
    `/quizzes/admin/questions/${questionId}/status`,
    { is_active: isActive },
  )
  return response.data
}

export const getAdminQuizPerformance = async () => {
  const response = await axiosClient.get('/quizzes/admin/performance')
  return response.data
}
