import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyQuizAttempts } from '../../services/quizService'

export default function QuizAttemptsPage() {
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
            Review quiz attempts saved from the backend database.
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

        {!isLoading && !error && attempts.length === 0 ? (
          <p className="mt-5 rounded-lg border border-orange-100 bg-white p-5 text-sm font-bold">
            No quiz attempts yet.
          </p>
        ) : null}

        <div className="mt-5 grid gap-4">
          {attempts.map((attempt) => (
            <Link
              key={attempt.id}
              to={`/quizzes/attempts/${attempt.id}`}
              className="rounded-lg border border-orange-100 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)] transition hover:-translate-y-0.5 hover:border-[#ffb088]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-black text-[#24140e]">
                    {attempt.category_title}
                  </h2>
                  <p className="mt-1 text-sm font-medium">
                    Submitted {new Date(attempt.submitted_at).toLocaleString()}
                  </p>
                </div>
                <span className="rounded-full bg-[#fff1e8] px-4 py-2 text-sm font-black text-[#f26322]">
                  {attempt.score}/{attempt.total_questions}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
