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
