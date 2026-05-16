import { Link, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import { getPathwayBySlug } from '../../constants/pathways'

function Section({ title, children }) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

export default function PathwayDetailPage() {
  const { pathwaySlug } = useParams()
  const pathway = getPathwayBySlug(pathwaySlug)

  if (!pathway) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <EmptyState
          title="Pathway not found"
          description="This fellowship pathway does not exist or has moved."
          actionLabel="View all pathways"
          actionTo="/fellowship"
        />
      </div>
    )
  }

  return (
    <div>
      <section className="bg-gradient-to-br from-indigo-600 to-cyan-600 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link to="/fellowship" className="text-sm text-indigo-100 hover:text-white">
            ← Fellowship overview
          </Link>
          <h1 className="mt-4 text-4xl font-bold">{pathway.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-indigo-100">{pathway.heroTagline}</p>
          {!pathway.comingSoon ? (
            <div className="mt-8">
              <Button
                to="/fellowship/apply"
                variant="secondary"
                className="bg-white text-indigo-700 hover:bg-indigo-50"
              >
                Apply for this pathway
              </Button>
            </div>
          ) : (
            <p className="mt-6 text-sm text-indigo-100">This pathway opens soon — check back or apply for another track.</p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <Section title="What you will learn">
          <ul className="grid gap-2 sm:grid-cols-2">
            {pathway.whatYouLearn.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-slate-700">
                <span className="text-indigo-600">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Tools covered">
          <div className="flex flex-wrap gap-2">
            {pathway.tools.map((tool) => (
              <span
                key={tool}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700"
              >
                {tool}
              </span>
            ))}
          </div>
        </Section>

        <Section title="Projects you will build">
          <ul className="list-disc space-y-2 pl-5 text-slate-600">
            {pathway.projects.map((project) => (
              <li key={project}>{project}</li>
            ))}
          </ul>
        </Section>

        <Section title="Weekly learning flow">
          <ul className="list-disc space-y-2 pl-5 text-slate-600">
            {pathway.weeklyFlow.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="font-semibold text-slate-900">Assessment method</h3>
            <p className="mt-2 text-sm text-slate-600">{pathway.assessment}</p>
          </Card>
          <Card>
            <h3 className="font-semibold text-slate-900">Career outcomes</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">
              {pathway.careers.map((role) => (
                <li key={role}>{role}</li>
              ))}
            </ul>
          </Card>
        </div>

        {!pathway.comingSoon ? (
          <div className="mt-12 text-center">
            <Button to="/fellowship/apply" size="lg">
              Apply Now
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
