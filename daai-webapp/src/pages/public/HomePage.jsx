import { Link } from 'react-router-dom'
import { Award, CalendarDays, CheckCircle2, Users } from 'lucide-react'
import PathwayCard from '../../components/public/PathwayCard'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import heroImage from '../../assets/hero.png'
import {
  FELLOWSHIP_PATHWAYS,
  HOW_IT_WORKS_STEPS,
  OUTCOMES,
  TRUST_CARDS,
} from '../../constants/pathways'

export default function HomePage() {
  const activePathways = FELLOWSHIP_PATHWAYS.filter((p) => !p.comingSoon)
  const heroStats = [
    { label: '12-16 weeks', helper: 'Structured cohort learning', icon: CalendarDays },
    { label: '4 learning tracks', helper: 'Cloud, Salesforce, QA, Data/AI', icon: CheckCircle2 },
    { label: 'Mentor-led', helper: 'Guidance and project review', icon: Users },
    { label: 'Certificate included', helper: 'Earned through completion', icon: Award },
  ]

  return (
    <>
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-200">
              CloudMandap · DAAI Fellowship
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              DAAI Fellowship Program
            </h1>
            <p className="mt-5 max-w-2xl text-xl font-semibold text-indigo-100">
              Build industry-ready skills in Cloud, Salesforce, QA, and Data/AI.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              A structured fellowship with mentor support, cohort accountability,
              hands-on projects, quizzes, assignments, and certification.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/fellowship/apply" size="lg">
                Apply Now
              </Button>
              <Button
                to="/fellowship#pathways"
                variant="secondary"
                size="lg"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                Explore Tracks
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur">
            <div className="grid gap-3 sm:grid-cols-2">
              {heroStats.map((stat) => {
                const Icon = stat.icon

                return (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-white/10 bg-white/10 p-4"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-indigo-400/20 text-indigo-100">
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="mt-4 text-lg font-bold text-white">{stat.label}</p>
                    <p className="mt-1 text-sm leading-5 text-slate-200">
                      {stat.helper}
                    </p>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 rounded-xl border border-indigo-300/20 bg-indigo-500/20 p-4">
              <p className="text-sm font-semibold text-indigo-100">
                Learn by building, submitting, reviewing, and improving with your cohort.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            Why fellows choose DAAI
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_CARDS.map((card) => (
              <Card key={card.title}>
                <h3 className="font-semibold text-slate-900">{card.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{card.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="pathways" className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">Fellowship pathways</h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            Choose a track aligned with cloud engineering, CRM development, quality
            assurance, or upcoming data &amp; AI foundations.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activePathways.map((pathway) => (
              <PathwayCard key={pathway.slug} pathway={pathway} />
            ))}
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Data &amp; AI Engineering pathway —{' '}
            <Link to="/fellowship/data-ai-engineering" className="text-indigo-600 hover:underline">
              preview the roadmap
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS_STEPS.map((item) => (
              <li key={item.step} className="rounded-xl border border-slate-200 bg-white p-5">
                <span className="text-sm font-bold text-indigo-600">Step {item.step}</span>
                <h3 className="mt-2 font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">What you will gain</h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {OUTCOMES.map((outcome) => (
              <li
                key={outcome}
                className="flex gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
              >
                <span className="mt-0.5 text-indigo-600" aria-hidden>
                  ✓
                </span>
                {outcome}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-indigo-600 py-16 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold">Start your fellowship journey with DAAI</h2>
          <p className="mt-4 max-w-xl text-center text-indigo-100">
            Join a cohort-driven program designed for career-ready skills in cloud, CRM,
            and quality engineering.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              to="/fellowship/apply"
              variant="secondary"
              className="border-white/30 bg-white text-indigo-700 hover:bg-indigo-50"
            >
              Apply Now
            </Button>
            <Button
              to="/login"
              className="border border-white/30 bg-transparent text-white hover:bg-indigo-500"
            >
              Fellow login
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
