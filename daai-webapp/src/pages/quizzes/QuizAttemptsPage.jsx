import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyQuizAttempts } from '../../services/quizService'
import useAuthStore from '../../store/authStore'
import { getFellowTrack, normalizeQuizSlug } from '../../utils/learningTrackAccess'

const PASSING_PERCENTAGE = 70

const getAttemptPercentage = (attempt) =>
  Math.round((attempt.score / attempt.total_questions) * 100)

const getAttemptStatus = (attempt) =>
  getAttemptPercentage(attempt) >= PASSING_PERCENTAGE ? 'Passed' : 'Needs Practice'

export default function QuizAttemptsPage() {
  const user = useAuthStore((state) => state.user)
  const [attempts, setAttempts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadAttempts = async () => {
      try {
        const data = await getMyQuizAttempts()

        if (isMounted) {
          setAttempts(data)
        }
      } catch {
        if (isMounted) {
          setError('Unable to load quiz attempts.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadAttempts()

    return () => {
      isMounted = false
    }
  }, [])

  const selectedTrack = getFellowTrack(user)
  const visibleAttempts = selectedTrack
    ? attempts.filter(
        (attempt) =>
          normalizeQuizSlug(attempt.category) ===
          normalizeQuizSlug(selectedTrack.quizSlug),
      )
    : attempts

  return (
    <main className="min-h-screen bg-[#fff8f3] px-4 py-8 text-[#6f5f57] sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
          <Link
            to="/quizzes"
            className="text-sm font-black text-[#f26322] hover:text-[#d94f13]"
          >
            Back to quizzes
          </Link>
          <p className="mt-5 text-xs font-black uppercase tracking-wide text-[#f26322]">
            Quiz Attempts
          </p>
          <h1 className="mt-2 text-3xl font-black text-[#24140e] lg:text-4xl">
            Your quiz results
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-medium">
            {selectedTrack
              ? `Review results for your ${selectedTrack.label} course.`
              : 'Review quiz attempts saved from the backend database.'}
          </p>
        </div>

        {isLoading ? (
          <p className="mt-5 rounded-lg border border-orange-100 bg-white p-5 text-sm font-bold">
            Loading attempts...
          </p>
        ) : null}

        {error ? (
          <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700">
            {error}
          </p>
        ) : null}

        {!isLoading && !error && visibleAttempts.length === 0 ? (
          <p className="mt-5 rounded-lg border border-orange-100 bg-white p-5 text-sm font-bold">
            {selectedTrack
              ? `No ${selectedTrack.label} quiz attempts yet.`
              : 'No quiz attempts yet.'}
          </p>
        ) : null}

        <div className="mt-5 grid gap-4">
          {visibleAttempts.map((attempt) => (
            <Link
              key={attempt.id}
              to={`/quizzes/attempts/${attempt.id}`}
              className="rounded-lg border border-orange-100 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)] transition hover:-translate-y-0.5 hover:border-[#ffb088]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-black text-[#24140e]">
                    {attempt.category_title}
                  </h2>
                  <div className="mt-3 grid gap-2 text-sm font-medium text-[#6f5f57] sm:grid-cols-2 lg:grid-cols-3">
                    <p>
                      <span className="font-black text-[#24140e]">Score:</span>{' '}
                      {attempt.score}/{attempt.total_questions} (
                      {getAttemptPercentage(attempt)}%)
                    </p>
                    <p>
                      <span className="font-black text-[#24140e]">Date:</span>{' '}
                      {new Date(attempt.submitted_at).toLocaleString()}
                    </p>
                    <p>
                      <span className="font-black text-[#24140e]">Category:</span>{' '}
                      {attempt.category_title}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={[
                      'rounded-full px-4 py-2 text-sm font-black',
                      getAttemptStatus(attempt) === 'Passed'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700',
                    ].join(' ')}
                  >
                    {getAttemptStatus(attempt)}
                  </span>
                  <span className="rounded-full bg-[#fff1e8] px-4 py-2 text-sm font-black text-[#f26322]">
                    Reopen Result
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
