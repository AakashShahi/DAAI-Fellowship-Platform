import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { getMyQuizAttempt } from '../../services/quizService'

export default function QuizResultPage() {
  const { category, attemptId } = useParams()
  const location = useLocation()
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
    return <Navigate to={`/quizzes/${category}`} replace />
  }

  const result = attemptResult
  const answers = result?.answers ?? []
  const correctAnswers = answers.filter((answer) => answer.is_correct)
  const wrongAnswers = answers.filter((answer) => !answer.is_correct)
  const percentage = result
    ? Math.round((result.score / result.total_questions) * 100)
    : 0

  return (
    <main className="min-h-screen bg-[#fff8f3] px-4 py-8 text-[#6f5f57] sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl">
        {isLoading ? (
          <p className="rounded-lg border border-orange-100 bg-white p-5 text-sm font-bold">
            Loading quiz result...
          </p>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700">
            {error}
          </p>
        ) : null}

        {!isLoading && !error && result ? (
          <>
            <div className="rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
              <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
                Quiz Result
              </p>
              <h1 className="mt-2 text-3xl font-black text-[#24140e] lg:text-4xl">
                {result.category_title}
              </h1>
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
              <p className="mt-4 text-sm font-bold text-[#24140e]">
                Percentage: {percentage}%
              </p>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <section className="rounded-lg border border-green-100 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
                <h2 className="text-xl font-black text-[#24140e]">
                  Correct answers
                </h2>
                <div className="mt-4 space-y-3">
                  {correctAnswers.length > 0 ? (
                    correctAnswers.map((answer) => (
                      <article
                        key={answer.question_id}
                        className="rounded-md bg-green-50 p-3"
                      >
                        <p className="text-sm font-black text-[#24140e]">
                          {answer.question}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-green-700">
                          {answer.correct_answer}
                        </p>
                      </article>
                    ))
                  ) : (
                    <p className="text-sm font-medium">No correct answers yet.</p>
                  )}
                </div>
              </section>

              <section className="rounded-lg border border-red-100 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
                <h2 className="text-xl font-black text-[#24140e]">
                  Wrong answers
                </h2>
                <div className="mt-4 space-y-3">
                  {wrongAnswers.length > 0 ? (
                    wrongAnswers.map((answer) => (
                      <article
                        key={answer.question_id}
                        className="rounded-md bg-red-50 p-3"
                      >
                        <p className="text-sm font-black text-[#24140e]">
                          {answer.question}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-red-700">
                          Your answer: {answer.selected_answer}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-green-700">
                          Correct answer: {answer.correct_answer}
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
                to={`/quizzes/${result.category}`}
                className="rounded-md bg-[#f26322] px-5 py-3 text-center text-sm font-black text-white transition hover:bg-[#d94f13]"
              >
                Retake Quiz
              </Link>
              <Link
                to="/quizzes"
                className="rounded-md border border-orange-100 bg-white px-5 py-3 text-center text-sm font-black text-[#f26322] transition hover:bg-[#fff1e8]"
              >
                Choose Another Quiz
              </Link>
              <Link
                to="/quizzes/attempts"
                className="rounded-md border border-orange-100 bg-white px-5 py-3 text-center text-sm font-black text-[#f26322] transition hover:bg-[#fff1e8]"
              >
                View Attempts
              </Link>
            </div>
          </>
        ) : null}
      </section>
    </main>
  )
}
