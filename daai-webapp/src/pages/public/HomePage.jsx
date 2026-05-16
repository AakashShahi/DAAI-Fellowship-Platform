import { Link } from 'react-router-dom'
import PathwayCard from '../../components/public/PathwayCard'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import {
  FELLOWSHIP_PATHWAYS,
  HOW_IT_WORKS_STEPS,
  OUTCOMES,
  TRUST_CARDS,
} from '../../constants/pathways'

export default function HomePage() {
  const activePathways = FELLOWSHIP_PATHWAYS.filter((p) => !p.comingSoon)

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            CloudMandap · DAAI Fellowship
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Build Industry-Ready Skills with the DAAI Fellowship
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-600">
            A hands-on fellowship program by CloudMandap focused on Data, Automation,
            Artificial Intelligence, Cloud, QA, Salesforce, and real-world project
            experience.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/fellowship/apply" size="lg">
              Apply Now
            </Button>
            <Button to="/fellowship#pathways" variant="secondary" size="lg">
              Explore Pathways
            </Button>
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
