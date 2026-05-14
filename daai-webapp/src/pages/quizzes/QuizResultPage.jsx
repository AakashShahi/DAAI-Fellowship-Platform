import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { getMyQuizAttempt } from '../../services/quizService'
import useAuthStore from '../../store/authStore'
import {
  canAccessQuiz,
  getQuizAccessMessage,
} from '../../utils/learningTrackAccess'

const PASSING_PERCENTAGE = 70
const DEFAULT_EXPLANATION =
  'No explanation is available for this question yet.'

export default function QuizResultPage() {
  const { category, attemptId } = useParams()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const [attemptResult, setAttemptResult] = useState(location.state?.result)
  const [isLoading, setIsLoading] = useState(Boolean(attemptId))
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadAttempt = async () => {
      if (!attemptId) {
        return
      }

      try {
        const data = await getMyQuizAttempt(attemptId)

        if (isMounted) {
          setAttemptResult(data)
        }
      } catch {
        if (isMounted) {
          setError('Unable to load quiz attempt.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadAttempt()

    return () => {
      isMounted = false
    }
  }, [attemptId])

  if (!attemptId && !attemptResult) {
    const fallback = category ? `/fellow/quizzes/${category}` : '/fellow/quizzes'
    return <Navigate to={fallback} replace />
  }

  const result = attemptResult
  const resultCategory = result?.category ?? category
  const hasResultAccess = !resultCategory || canAccessQuiz(user, resultCategory)
  const answers = result?.answers ?? []
  const correctAnswers = answers.filter((answer) => answer.is_correct)
  const wrongAnswers = answers.filter((answer) => !answer.is_correct)
  const percentage = result
    ? Math.round((result.score / result.total_questions) * 100)
    : 0
  const resultStatus = percentage >= PASSING_PERCENTAGE ? 'Passed' : 'Needs Practice'

  if (!hasResultAccess) {
    return (
      <div className="min-h-screen bg-[#fff8f3] px-4 py-8 text-[#6f5f57] sm:px-6 lg:px-8">
        <section className="mx-auto max-w-5xl rounded-lg border border-red-200 bg-red-50 p-6 text-red-700 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
          <p className="text-sm font-black">
            {getQuizAccessMessage(user, resultCategory)}
          </p>
          <Link
            to="/fellow/dashboard"
            className="mt-5 inline-flex rounded-md bg-[#f26322] px-5 py-3 text-center text-sm font-black text-white transition hover:bg-[#d94f13]"
          >
            Go to overview
          </Link>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fff8f3] px-4 py-8 text-[#6f5f57] sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl">
        {isLoading ? (
          <div className="rounded-lg border border-orange-100 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
            <p className="text-sm font-bold">Loading quiz result...</p>
          </div>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700">
            {error}
          </p>
        ) : null}

        {!isLoading && !error && result ? (
          <>
            <div className="rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
                    Quiz Result
                  </p>
                  <h1 className="mt-2 text-3xl font-black text-[#24140e] lg:text-4xl">
                    {result.category_title}
                  </h1>
                </div>
                <div className="rounded-lg border border-orange-100 bg-[#fff8f3] px-5 py-4 lg:text-right">
                  <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
                    Percentage
                  </p>
                  <p className="mt-1 text-4xl font-black text-[#24140e]">
                    {percentage}%
                  </p>
                  <span
                    className={[
                      'mt-3 inline-flex rounded-full px-4 py-2 text-sm font-black',
                      resultStatus === 'Passed'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700',
                    ].join(' ')}
                  >
                    {resultStatus}
                  </span>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-[#fff1e8] p-4">
                  <p className="text-xs font-black uppercase text-[#f26322]">
                    Total Score
                  </p>
                  <p className="mt-2 text-3xl font-black text-[#24140e]">
                    {result.score}/{result.total_questions}
                  </p>
                </div>
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-xs font-black uppercase text-green-700">
                    Correct
                  </p>
                  <p className="mt-2 text-3xl font-black text-[#24140e]">
                    {correctAnswers.length}
                  </p>
                </div>
                <div className="rounded-lg bg-red-50 p-4">
                  <p className="text-xs font-black uppercase text-red-700">
                    Wrong
                  </p>
                  <p className="mt-2 text-3xl font-black text-[#24140e]">
                    {wrongAnswers.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <section className="rounded-lg border border-green-200 bg-green-50/50 p-5 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-black text-[#14532d]">
                    Correct answers
                  </h2>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-green-700">
                    {correctAnswers.length}
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {correctAnswers.length > 0 ? (
                    correctAnswers.map((answer, index) => (
                      <article
                        key={answer.question_id}
                        className="rounded-md border border-green-200 bg-white p-4"
                      >
                        <p className="text-xs font-black uppercase tracking-wide text-green-700">
                          Question {index + 1}
                        </p>
                        <p className="mt-2 text-sm font-black text-[#24140e]">
                          {answer.question}
                        </p>
                        <p className="mt-3 rounded-md bg-green-50 p-3 text-sm font-semibold text-green-700">
                          Your answer: {answer.selected_answer}
                        </p>
                        <p className="mt-3 text-sm font-medium text-[#6f5f57]">
                          <span className="font-black text-[#24140e]">
                            Explanation:
                          </span>{' '}
                          {answer.explanation || DEFAULT_EXPLANATION}
                        </p>
                      </article>
                    ))
                  ) : (
                    <p className="text-sm font-medium">No correct answers yet.</p>
                  )}
                </div>
              </section>

              <section className="rounded-lg border border-red-200 bg-red-50/50 p-5 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-black text-[#7f1d1d]">
                    Wrong answers
                  </h2>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-red-700">
                    {wrongAnswers.length}
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {wrongAnswers.length > 0 ? (
                    wrongAnswers.map((answer, index) => (
                      <article
                        key={answer.question_id}
                        className="rounded-md border border-red-200 bg-white p-4"
                      >
                        <p className="text-xs font-black uppercase tracking-wide text-red-700">
                          Question {index + 1}
                        </p>
                        <p className="mt-2 text-sm font-black text-[#24140e]">
                          {answer.question}
                        </p>
                        <p className="mt-3 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">
                          Your answer: {answer.selected_answer}
                        </p>
                        <p className="mt-2 rounded-md bg-green-50 p-3 text-sm font-semibold text-green-700">
                          Correct answer: {answer.correct_answer}
                        </p>
                        <p className="mt-3 text-sm font-medium text-[#6f5f57]">
                          <span className="font-black text-[#24140e]">
                            Explanation:
                          </span>{' '}
                          {answer.explanation || DEFAULT_EXPLANATION}
                        </p>
                      </article>
                    ))
                  ) : (
                    <p className="text-sm font-medium">
                      No wrong answers. Nice work.
                    </p>
                  )}
                </div>
              </section>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                to={`/fellow/quizzes/${result.category}`}
                className="rounded-md bg-[#f26322] px-5 py-3 text-center text-sm font-black text-white transition hover:bg-[#d94f13]"
              >
                Retake quiz
              </Link>
              <Link
                to="/fellow/quizzes/attempts"
                className="rounded-md border border-orange-100 bg-white px-5 py-3 text-center text-sm font-black text-[#f26322] transition hover:bg-[#fff1e8]"
              >
                All attempts
              </Link>
            </div>
          </>
        ) : null}
      </section>
    </div>
  )
}
