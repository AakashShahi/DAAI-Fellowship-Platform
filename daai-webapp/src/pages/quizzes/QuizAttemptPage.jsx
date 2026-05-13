import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  getQuizCategories,
  getQuizQuestions,
  submitQuiz,
} from '../../services/quizService'

export default function QuizAttemptPage() {
  const { category } = useParams()
  const navigate = useNavigate()
  const [quizTitle, setQuizTitle] = useState(category)
  const [questions, setQuestions] = useState([])
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  const answeredCount = useMemo(
    () => Object.keys(selectedAnswers).length,
    [selectedAnswers],
  )

  useEffect(() => {
    let isMounted = true

    const loadQuiz = async () => {
      setIsLoading(true)
      setError('')
      setNotFound(false)
      setSelectedAnswers({})

      try {
        const [categories, questionData] = await Promise.all([
          getQuizCategories(),
          getQuizQuestions(category),
        ])
        const matchedCategory = categories.find((item) => item.slug === category)

        if (isMounted) {
          setQuizTitle(matchedCategory?.title ?? category)
          setQuestions(questionData)
        }
      } catch (loadError) {
        if (isMounted) {
          if (loadError?.response?.status === 404) {
            setNotFound(true)
          } else {
            setError('Unable to load quiz questions.')
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadQuiz()

    return () => {
      isMounted = false
    }
  }, [category])

  if (notFound) {
    return <Navigate to="/quizzes" replace />
  }

  const handleAnswerChange = (questionId, answer) => {
    setSelectedAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: answer,
    }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (answeredCount !== questions.length) {
      setError('Please answer all questions before submitting.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const result = await submitQuiz(category, selectedAnswers)
      sessionStorage.setItem(`quiz-result:${category}`, JSON.stringify(result))
      navigate(`/quizzes/${category}/result`, { state: { result } })
    } catch (submitError) {
      const detail = submitError?.response?.data?.detail
      setError(
        typeof detail === 'string'
          ? detail
          : 'Unable to submit quiz. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
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
            {quizTitle}
          </h1>
          <p className="mt-3 text-sm font-medium">
            Questions are loaded from the backend. Your score will be calculated
            and saved by the server.
          </p>
          <p className="mt-4 text-sm font-black text-[#24140e]">
            {answeredCount} of {questions.length} answered
          </p>
        </div>

        {isLoading ? (
          <p className="rounded-lg border border-orange-100 bg-white p-5 text-sm font-bold">
            Loading questions...
          </p>
        ) : null}

        {!isLoading && !error && questions.length === 0 ? (
          <p className="rounded-lg border border-orange-100 bg-white p-5 text-sm font-bold">
            No questions found for this category.
          </p>
        ) : null}

        <div className="space-y-4">
          {questions.map((question, questionIndex) => (
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
            disabled={isSubmitting || isLoading || questions.length === 0}
            className="rounded-md bg-[#f26322] px-5 py-3 text-sm font-black text-white transition hover:bg-[#d94f13] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </form>
    </main>
  )
}
