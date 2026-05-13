import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { getQuizByCategory } from '../../data/quizData'

const getStoredResult = (category) => {
  const storedResult = sessionStorage.getItem(`quiz-result:${category}`)

  if (!storedResult) {
    return null
  }

  try {
    return JSON.parse(storedResult)
  } catch {
    sessionStorage.removeItem(`quiz-result:${category}`)
    return null
  }
}

export default function QuizResultPage() {
  const { category } = useParams()
  const location = useLocation()
  const quiz = getQuizByCategory(category)
  const result = location.state?.result ?? getStoredResult(category)

  if (!quiz) {
    return <Navigate to="/quizzes" replace />
  }

  if (!result) {
    return <Navigate to={`/quizzes/${category}`} replace />
  }

  const correctAnswers = result.answers.filter((answer) => answer.isCorrect)
  const wrongAnswers = result.answers.filter((answer) => !answer.isCorrect)
  const percentage = Math.round((result.score / result.totalQuestions) * 100)

  return (
    <main className="min-h-screen bg-[#fff8f3] px-4 py-8 text-[#6f5f57] sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
          <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
            Quiz Result
          </p>
          <h1 className="mt-2 text-3xl font-black text-[#24140e] lg:text-4xl">
            {result.title}
          </h1>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-[#fff1e8] p-4">
              <p className="text-xs font-black uppercase text-[#f26322]">
                Total Score
              </p>
              <p className="mt-2 text-3xl font-black text-[#24140e]">
                {result.score}/{result.totalQuestions}
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
              <p className="text-xs font-black uppercase text-red-700">Wrong</p>
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
                  <article key={answer.id} className="rounded-md bg-green-50 p-3">
                    <p className="text-sm font-black text-[#24140e]">
                      {answer.question}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-green-700">
                      {answer.correctAnswer}
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-sm font-medium">No correct answers yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-red-100 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
            <h2 className="text-xl font-black text-[#24140e]">Wrong answers</h2>
            <div className="mt-4 space-y-3">
              {wrongAnswers.length > 0 ? (
                wrongAnswers.map((answer) => (
                  <article key={answer.id} className="rounded-md bg-red-50 p-3">
                    <p className="text-sm font-black text-[#24140e]">
                      {answer.question}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-red-700">
                      Your answer: {answer.selectedAnswer}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-green-700">
                      Correct answer: {answer.correctAnswer}
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-sm font-medium">No wrong answers. Nice work.</p>
              )}
            </div>
          </section>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            to={`/quizzes/${category}`}
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
        </div>
      </section>
    </main>
  )
}

