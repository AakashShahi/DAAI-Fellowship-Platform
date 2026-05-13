import { Link } from 'react-router-dom'
import { quizCategories, quizzes } from '../../data/quizData'

export default function QuizListPage() {
  return (
    <main className="min-h-screen bg-[#fff8f3] px-4 py-8 text-[#6f5f57] sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
          <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
            Quizzes
          </p>
          <h1 className="mt-2 text-3xl font-black text-[#24140e] lg:text-4xl">
            Choose a quiz category
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-medium">
            Practice with sample multiple-choice questions for the DAAI
            Fellowship learning tracks.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {quizCategories.map((category) => (
            <Link
              key={category.slug}
              to={`/quizzes/${category.slug}`}
              className="rounded-lg border border-orange-100 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)] transition hover:-translate-y-0.5 hover:border-[#ffb088]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-[#24140e]">
                    {category.title}
                  </h2>
                  <p className="mt-2 text-sm font-medium text-[#6f5f57]">
                    {category.description}
                  </p>
                </div>
                <span className="rounded-full bg-[#fff1e8] px-3 py-1 text-xs font-black text-[#f26322]">
                  {quizzes[category.slug].questions.length} questions
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}

