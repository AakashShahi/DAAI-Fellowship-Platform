import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  getQuizCategories,
  getQuizQuestions,
  submitQuiz,
} from '../../services/quizService'
import useAuthStore from '../../store/authStore'
import {
  canAccessQuiz,
  getFellowTrack,
  getQuizAccessMessage,
} from '../../utils/learningTrackAccess'

const getLoadErrorMessage = (error) => {
  const detail = error?.response?.data?.detail

  if (typeof detail === 'string') {
    return detail
  }

  if (error?.response?.status === 401) {
    return 'Your session could not be verified. Please log in again.'
  }

  return 'Unable to load quiz questions.'
}

export default function QuizAttemptPage() {
  const { category } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [quizTitle, setQuizTitle] = useState(category)
  const [questions, setQuestions] = useState([])
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  const answeredCount = useMemo(
    () => Object.keys(selectedAnswers).length,
    [selectedAnswers],
  )
  const progressPercentage =
    questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0
  const selectedTrack = getFellowTrack(user)
  const hasQuizAccess = canAccessQuiz(user, category)

  useEffect(() => {
    let isMounted = true

    const loadQuiz = async () => {
      if (!hasQuizAccess) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError('')
      setNotFound(false)
      setSelectedAnswers({})
      setHasTriedSubmit(false)

      try {
        const categories = await getQuizCategories()
        const matchedCategory = categories.find((item) => item.slug === category)

        if (isMounted) {
          setQuizTitle(matchedCategory?.title ?? category)
        }

        const questionData = await getQuizQuestions(category)

        if (isMounted) {
          setQuestions(questionData)
        }
      } catch (loadError) {
        if (isMounted) {
          if (loadError?.response?.status === 404) {
            setNotFound(true)
          } else {
            setError(getLoadErrorMessage(loadError))
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
  }, [category, hasQuizAccess])

  if (notFound) {
    return <Navigate to="/quizzes" replace />
  }

  if (!hasQuizAccess) {
    return (
      <main className="min-h-screen bg-[#fff8f3] px-4 py-8 text-[#6f5f57] sm:px-6 lg:px-8">
        <section className="mx-auto max-w-4xl rounded-lg border border-red-200 bg-red-50 p-6 text-red-700 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
          <p className="text-sm font-black">{getQuizAccessMessage(user, category)}</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/fellow/dashboard"
              className="rounded-md bg-[#f26322] px-5 py-3 text-center text-sm font-black text-white transition hover:bg-[#d94f13]"
            >
              Back to Dashboard
            </Link>
            {selectedTrack ? (
              <Link
                to={selectedTrack.quizPath}
                className="rounded-md border border-orange-100 bg-white px-5 py-3 text-center text-sm font-black text-[#f26322] transition hover:bg-[#fff1e8]"
              >
                Open {selectedTrack.label} Quiz
              </Link>
            ) : null}
          </div>
        </section>
      </main>
    )
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
    setHasTriedSubmit(true)

    if (answeredCount !== questions.length) {
      setError('Please answer all questions before submitting.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const result = await submitQuiz(category, selectedAnswers)
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
          <div className="mt-3" aria-label="Quiz completion progress">
            <div className="h-3 overflow-hidden rounded-full bg-orange-100">
              <div
                className="h-full rounded-full bg-[#f26322] transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-black uppercase tracking-wide text-[#f26322]">
              {progressPercentage}% complete
            </p>
          </div>
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
          {questions.map((question, questionIndex) => {
            const isAnswered = Boolean(selectedAnswers[question.id])
            const shouldHighlightUnanswered = hasTriedSubmit && !isAnswered

            return (
              <fieldset
                key={question.id}
                className={[
                  'rounded-lg border bg-white p-5 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)] transition',
                  shouldHighlightUnanswered
                    ? 'border-red-300 bg-red-50/40'
                    : 'border-orange-100',
                ].join(' ')}
              >
                <legend className="text-base font-black text-[#24140e]">
                  <span className="block text-xs font-black uppercase tracking-wide text-[#f26322]">
                    Question {questionIndex + 1} of {questions.length}
                  </span>
                  <span className="mt-2 block">{question.question}</span>
                </legend>

                {shouldHighlightUnanswered ? (
                  <p className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
                    Please choose an answer for this question.
                  </p>
                ) : null}

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
            )
          })}
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
