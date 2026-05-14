import { Link, Navigate, useParams } from 'react-router-dom'
import FellowTopbar from '../../components/dashboard/FellowTopbar'
import { LEARNING_TRACKS_BY_SLUG } from '../../constants/learningTracks'
import useAuthStore from '../../store/authStore'
import {
  canAccessQuiz,
  getFellowTrack,
  getQuizAccessMessage,
} from '../../utils/learningTrackAccess'

export default function LearningTrackDetailPage() {
  const { trackSlug } = useParams()
  const user = useAuthStore((state) => state.user)
  const track = LEARNING_TRACKS_BY_SLUG[trackSlug]
  const selectedTrack = getFellowTrack(user)

  if (!track) {
    return <Navigate to="/fellow/dashboard" replace />
  }

  if (selectedTrack && !canAccessQuiz(user, track.quizSlug)) {
    return (
      <main className="app-home">
        <FellowTopbar selectedTrack={selectedTrack} />
        <section className="mx-auto mt-7 max-w-5xl rounded-lg border border-red-200 bg-red-50 p-6 text-red-700 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
          <p className="text-sm font-black">
            {getQuizAccessMessage(user, track.quizSlug)}
          </p>
          <Link
            to="/fellow/dashboard"
            className="mt-5 inline-flex rounded-md bg-[#f26322] px-5 py-3 text-center text-sm font-black text-white transition hover:bg-[#d94f13]"
          >
            Back to Dashboard
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="app-home">
      <FellowTopbar selectedTrack={selectedTrack ?? track} />
      <section className="mx-auto mt-7 max-w-5xl">
        <div className="rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
          <Link
            to="/fellow/dashboard"
            className="text-sm font-black text-[#f26322] hover:text-[#d94f13]"
          >
            Back to fellow dashboard
          </Link>

          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_280px] lg:items-start">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
                Learning Track
              </p>
              <h1 className="mt-2 text-3xl font-black text-[#24140e] lg:text-4xl">
                {track.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-medium">
                {track.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#fff1e8] px-3 py-1 text-xs font-black text-[#f26322]">
                  {track.pathLabel}
                </span>
                {track.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-[#6f5f57]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <aside className="rounded-lg border border-orange-100 bg-[#fff8f3] p-5">
              <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
                Progress
              </p>
              <p className="mt-2 text-4xl font-black text-[#24140e]">0%</p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-orange-100">
                <span className="block h-full w-0 rounded-full bg-[#f26322]" />
              </div>
              <p className="mt-3 text-sm font-bold">
                Progress tracking will connect to backend learning modules later.
              </p>
            </aside>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_300px]">
          <section className="rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
            <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
              Modules
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#24140e]">
              What you will work through
            </h2>
            <div className="mt-5 grid gap-3">
              {track.modules.map((module, index) => (
                <article
                  key={module}
                  className="rounded-md border border-orange-100 bg-[#fff8f3] p-4"
                >
                  <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
                    Module {index + 1}
                  </p>
                  <h3 className="mt-1 text-base font-black text-[#24140e]">
                    {module}
                  </h3>
                  <p className="mt-2 text-sm font-medium">
                    Module content and completion status will be added when course
                    APIs are available.
                  </p>
                </article>
              ))}
            </div>
          </section>

          <aside className="rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
            <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
              Next Step
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#24140e]">
              Practice this track
            </h2>
            <p className="mt-3 text-sm font-medium">
              Start the quiz for this learning track and use your result to guide
              what to review next.
            </p>
            <div className="mt-5 grid gap-3">
              <Link
                to={track.quizPath}
                className="rounded-md bg-[#f26322] px-5 py-3 text-center text-sm font-black text-white transition hover:bg-[#d94f13]"
              >
                Take Quiz
              </Link>
              <Link
                to="/fellow/dashboard"
                className="rounded-md border border-orange-100 bg-white px-5 py-3 text-center text-sm font-black text-[#f26322] transition hover:bg-[#fff1e8]"
              >
                Back to Dashboard
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
