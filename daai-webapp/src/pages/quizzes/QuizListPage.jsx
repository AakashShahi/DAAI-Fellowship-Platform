import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getQuizCategories,
  getQuizQuestions,
} from '../../services/quizService'
import useAuthStore from '../../store/authStore'
import { getFellowTrack, normalizeQuizSlug } from '../../utils/learningTrackAccess'

export default function QuizListPage() {
  const user = useAuthStore((state) => state.user)
  const [categories, setCategories] = useState([])
  const [questionCounts, setQuestionCounts] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadCategories = async () => {
      try {
        const categoryData = await getQuizCategories()
        const countEntries = await Promise.all(
          categoryData.map(async (category) => {
            const questions = await getQuizQuestions(category.slug)
            return [category.slug, questions.length]
          }),
        )

        if (isMounted) {
          setCategories(categoryData)
          setQuestionCounts(Object.fromEntries(countEntries))
        }
      } catch {
        if (isMounted) {
          setError('Unable to load quiz categories. Please check the backend.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCategories()

    return () => {
      isMounted = false
    }
  }, [])

  const selectedTrack = getFellowTrack(user)
  const visibleCategories = selectedTrack
    ? categories.filter(
        (category) =>
          normalizeQuizSlug(category.slug) === normalizeQuizSlug(selectedTrack.quizSlug),
      )
    : categories
  const isFellowWithoutTrack = user?.role === 'FELLOW' && !selectedTrack

  return (
    <div className="min-h-screen bg-[#fff8f3] px-4 py-8 text-[#6f5f57] sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
          <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
            Quizzes
          </p>
          <h1 className="mt-2 text-3xl font-black text-[#24140e] lg:text-4xl">
            {selectedTrack ? `${selectedTrack.label} Quiz` : 'Choose a quiz category'}
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-medium">
            {selectedTrack
              ? 'Your quiz access is limited to your selected fellowship course.'
              : 'Questions now load from the backend quiz API and MongoDB seed data.'}
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/fellow/quizzes/attempts"
              className="inline-flex justify-center rounded-md bg-[#f26322] px-4 py-2 text-sm font-black text-white transition hover:bg-[#d94f13]"
            >
              My Attempts
            </Link>
          </div>
        </div>

        {isLoading ? (
          <p className="rounded-lg border border-orange-100 bg-white p-5 text-sm font-bold">
            Loading quiz categories...
          </p>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700">
            {error}
          </p>
        ) : null}

        {isFellowWithoutTrack ? (
          <div className="rounded-lg border border-orange-100 bg-white p-5 text-sm font-bold shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
            Select your learning track before opening quizzes.
            <Link className="ml-2 text-[#f26322] hover:text-[#d94f13]" to="/fellow/dashboard">
              Go to dashboard
            </Link>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          {!isFellowWithoutTrack && visibleCategories.map((category) => (
            <Link
              key={category.slug}
              to={`/fellow/quizzes/${category.slug}`}
              className="rounded-lg border border-orange-100 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)] transition hover:-translate-y-0.5 hover:border-[#ffb088]"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-black text-[#24140e]">
                    {category.title}
                  </h2>
                  <p className="mt-2 text-sm font-medium text-[#6f5f57]">
                    {category.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <span className="rounded-full bg-[#fff1e8] px-3 py-1 text-xs font-black text-[#f26322]">
                    {category.difficulty_label}
                  </span>
                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-[#6f5f57]">
                    {questionCounts[category.slug] ?? 0} questions
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
