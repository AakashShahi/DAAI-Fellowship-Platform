import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  getQuizCategories,
  getQuizQuestions,
  submitQuiz,
} from '../../services/quizService'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  const answeredCount = useMemo(
    () => Object.keys(selectedAnswers).length,
    [selectedAnswers],
  )
  const progressPercentage =
    questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0
  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = currentQuestion
    ? selectedAnswers[currentQuestion.id]
    : undefined
  const isLastQuestion = currentQuestionIndex === questions.length - 1
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
      setCurrentQuestionIndex(0)
      setIsConfirmOpen(false)

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
    return <Navigate to="/fellow/quizzes" replace />
  }

  if (!hasQuizAccess) {
    return (
      <div className="min-h-screen bg-[#f8fafc] px-4 py-8 text-[#475569] sm:px-6 lg:px-8">
        <section className="mx-auto max-w-4xl rounded-lg border border-red-200 bg-red-50 p-6 text-red-700 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)]">
          <p className="text-sm font-black">{getQuizAccessMessage(user, category)}</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/fellow/dashboard"
              className="rounded-md bg-[#4f46e5] px-5 py-3 text-center text-sm font-black text-white transition hover:bg-[#4338ca]"
            >
              Go to overview
            </Link>
            {selectedTrack ? (
              <Link
                to={selectedTrack.quizPath}
                className="rounded-md border border-slate-200 bg-white px-5 py-3 text-center text-sm font-black text-[#4f46e5] transition hover:bg-[#eef2ff]"
              >
                Open {selectedTrack.label} quiz
              </Link>
            ) : null}
          </div>
        </section>
      </div>
    )
  }

  const handleAnswerChange = (questionId, answer) => {
    setSelectedAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: answer,
    }))
    setError('')
  }

  const goToPreviousQuestion = () => {
    setCurrentQuestionIndex((currentIndex) => Math.max(currentIndex - 1, 0))
    setError('')
  }

  const goToNextQuestion = () => {
    if (!currentAnswer) {
      setError('Please choose an answer before moving to the next question.')
      return
    }

    setCurrentQuestionIndex((currentIndex) =>
      Math.min(currentIndex + 1, questions.length - 1),
    )
    setError('')
  }

  const openSubmitConfirmation = () => {
    setHasTriedSubmit(true)
    setIsConfirmOpen(true)
  }

  const handleSubmit = async () => {
    setHasTriedSubmit(true)
    if (answeredCount !== questions.length) {
      setError('Please answer all questions before submitting.')
      setIsConfirmOpen(false)
      return
    }

    setIsSubmitting(true)
    setError('')
    setIsConfirmOpen(false)

    try {
      const result = await submitQuiz(category, selectedAnswers)
      navigate(`/fellow/quizzes/${category}/result`, { state: { result } })
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
    <div className="min-h-screen bg-[#f8fafc] px-4 py-8 text-[#475569] sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl">
        <div className="mb-5 rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)]">
          <p className="text-xs font-black uppercase tracking-wide text-[#4f46e5]">
            Quiz Attempt
          </p>
          <h1 className="mt-2 text-3xl font-black text-[#0f172a] lg:text-4xl">
            {quizTitle}
          </h1>
          <p className="mt-3 text-sm font-medium">
            Questions are loaded from the backend. Your score will be calculated
            and saved by the server.
          </p>
          <p className="mt-4 text-sm font-black text-[#0f172a]">
            {answeredCount} of {questions.length} answered
          </p>
          <div className="mt-3" aria-label="Quiz completion progress">
            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[#4f46e5] transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-black uppercase tracking-wide text-[#4f46e5]">
              {progressPercentage}% complete
            </p>
          </div>
        </div>

        {isLoading ? (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-bold">
            Loading questions...
          </p>
        ) : null}

        {!isLoading && !error && questions.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-bold">
            No questions found for this category.
          </p>
        ) : null}

        {!isLoading && questions.length > 0 ? (
          <>
            <div className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="mb-3 text-xs font-black uppercase tracking-wide text-[#64748b]">
                Question Navigator
              </p>
              <div className="flex flex-wrap gap-2">
                {questions.map((question, questionIndex) => {
                  const isCurrent = questionIndex === currentQuestionIndex
                  const isAnswered = Boolean(selectedAnswers[question.id])

                  return (
                    <button
                      key={question.id}
                      type="button"
                      className={[
                        'h-10 w-10 rounded-md border text-sm font-black transition',
                        isCurrent
                          ? 'border-[#4f46e5] bg-[#4f46e5] text-white shadow-sm'
                          : isAnswered
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'border-slate-200 bg-white text-[#475569] hover:bg-slate-50',
                      ].join(' ')}
                      onClick={() => {
                        setCurrentQuestionIndex(questionIndex)
                        setError('')
                      }}
                      aria-label={`Go to question ${questionIndex + 1}`}
                    >
                      {questionIndex + 1}
                    </button>
                  )
                })}
              </div>
            </div>

            {currentQuestion ? (
              <fieldset
                className={[
                  'rounded-lg border bg-white p-5 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)] transition',
                  hasTriedSubmit && !currentAnswer
                    ? 'border-red-300 bg-red-50/40'
                    : 'border-slate-200',
                ].join(' ')}
              >
                <legend className="text-base font-black text-[#0f172a]">
                  <span className="block text-xs font-black uppercase tracking-wide text-[#4f46e5]">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="mt-2 block">{currentQuestion.question}</span>
                </legend>

                {hasTriedSubmit && !currentAnswer ? (
                  <p className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
                    Please choose an answer for this question.
                  </p>
                ) : null}

                <div className="mt-4 grid gap-3">
                  {currentQuestion.options.map((option) => {
                    const isSelected = currentAnswer === option

                    return (
                      <label
                        key={option}
                        className={[
                          'flex cursor-pointer items-start gap-3 rounded-lg border p-4 text-sm font-semibold transition',
                          isSelected
                            ? 'border-[#4f46e5] bg-[#eef2ff] text-[#0f172a] shadow-sm'
                            : 'border-slate-200 bg-white text-[#475569] hover:bg-slate-50',
                        ].join(' ')}
                      >
                        <input
                          type="radio"
                          name={currentQuestion.id}
                          value={option}
                          checked={isSelected}
                          onChange={() =>
                            handleAnswerChange(currentQuestion.id, option)
                          }
                          className="mt-1 accent-indigo-600"
                        />
                        <span>{option}</span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>
            ) : null}
          </>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
            {error}
          </p>
        ) : null}

        {questions.length > 0 ? (
          <div className="mt-5">
            <p className="mb-3 text-sm font-medium">
              You can review your answers before submitting.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                disabled={currentQuestionIndex === 0 || isSubmitting || isLoading}
                onClick={goToPreviousQuestion}
                className="rounded-md border border-slate-200 bg-white px-5 py-3 text-sm font-black text-[#475569] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Previous
              </button>
              {isLastQuestion ? (
                <button
                  type="button"
                  disabled={isSubmitting || isLoading || !currentAnswer}
                  onClick={openSubmitConfirmation}
                  className="rounded-md bg-[#4f46e5] px-5 py-3 text-sm font-black text-white transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting || isLoading || !currentAnswer}
                  onClick={goToNextQuestion}
                  className="rounded-md bg-[#4f46e5] px-5 py-3 text-sm font-black text-white transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        ) : null}

        <ConfirmDialog
          open={isConfirmOpen}
          title="Submit quiz?"
          message={[
            `You answered ${answeredCount} of ${questions.length} questions. Once submitted, your score will be calculated and saved.`,
            answeredCount !== questions.length
              ? 'You still have unanswered questions.'
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
          confirmLabel="Submit Quiz"
          isLoading={isSubmitting}
          onCancel={() => setIsConfirmOpen(false)}
          onConfirm={handleSubmit}
        />
      </section>
    </div>
  )
}
