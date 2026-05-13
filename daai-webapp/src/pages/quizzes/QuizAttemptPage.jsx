import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { getQuizByCategory } from '../../data/quizData'

export default function QuizAttemptPage() {
  const { category } = useParams()
  const navigate = useNavigate()
  const quiz = getQuizByCategory(category)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [error, setError] = useState('')

  const answeredCount = useMemo(
    () => Object.keys(selectedAnswers).length,
    [selectedAnswers],
  )

  if (!quiz) {
    return <Navigate to="/quizzes" replace />
  }

  const handleAnswerChange = (questionId, answer) => {
    setSelectedAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: answer,
    }))
    setError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (answeredCount !== quiz.questions.length) {
      setError('Please answer all questions before submitting.')
      return
    }

    const answers = quiz.questions.map((question) => {
      const selectedAnswer = selectedAnswers[question.id]
      const isCorrect = selectedAnswer === question.correctAnswer

      return {
        id: question.id,
        question: question.question,
        selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
      }
    })

    const score = answers.filter((answer) => answer.isCorrect).length
    const result = {
      category,
      title: quiz.title,
      totalQuestions: quiz.questions.length,
      score,
      answers,
    }

    sessionStorage.setItem(`quiz-result:${category}`, JSON.stringify(result))
    navigate(`/quizzes/${category}/result`, { state: { result } })
  }

  return (
    <main className="min-h-screen bg-[#fff8f3] px-4 py-8 text-[#6f5f57] sm:px-6 lg:px-8">
      <form className="mx-auto max-w-4xl" onSubmit={handleSubmit}>
        <div className="mb-5 rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
          <Link
            to="/quizzes"
            className="text-sm font-black text-[#f26322] hover:text-[#d94f13]"
          >
            Back to quizzes
          </Link>
          <p className="mt-5 text-xs font-black uppercase tracking-wide text-[#f26322]">
            Quiz Attempt
          </p>
          <h1 className="mt-2 text-3xl font-black text-[#24140e] lg:text-4xl">
            {quiz.title}
          </h1>
          <p className="mt-3 text-sm font-medium">
            Answer all questions and submit to see your score.
          </p>
          <p className="mt-4 text-sm font-black text-[#24140e]">
            {answeredCount} of {quiz.questions.length} answered
          </p>
        </div>

        <div className="space-y-4">
          {quiz.questions.map((question, questionIndex) => (
            <fieldset
              key={question.id}
              className="rounded-lg border border-orange-100 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]"
            >
              <legend className="text-base font-black text-[#24140e]">
                {questionIndex + 1}. {question.question}
              </legend>

              <div className="mt-4 grid gap-3">
                {question.options.map((option) => (
                  <label
                    key={option}
                    className={[
                      'flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm font-semibold transition',
                      selectedAnswers[question.id] === option
                        ? 'border-[#f26322] bg-[#fff1e8] text-[#24140e]'
                        : 'border-orange-100 bg-white text-[#6f5f57] hover:border-[#ffb088]',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      checked={selectedAnswers[question.id] === option}
                      onChange={() => handleAnswerChange(question.id, option)}
                      className="mt-1 accent-[#f26322]"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        {error ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium">
            You can review your answers before submitting.
          </p>
          <button
            type="submit"
            className="rounded-md bg-[#f26322] px-5 py-3 text-sm font-black text-white transition hover:bg-[#d94f13]"
          >
            Submit Quiz
          </button>
        </div>
      </form>
    </main>
  )
}

