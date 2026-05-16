import PathwayCard from '../../components/public/PathwayCard'
import Button from '../../components/ui/Button'
import {
  FELLOWSHIP_PATHWAYS,
  HOW_IT_WORKS_STEPS,
  OUTCOMES,
} from '../../constants/pathways'

const FAQ = [
  {
    q: 'Who should apply?',
    a: 'Students, career switchers, and early professionals ready for intensive hands-on learning in cloud, CRM, or QA.',
  },
  {
    q: 'How are tracks assigned?',
    a: 'You may indicate a preferred pathway during application. Final placement considers aptitude, cohort capacity, and program fit.',
  },
  {
    q: 'Is the program remote?',
    a: 'Cohorts may run hybrid or remote depending on schedule. Sessions and materials are available in the fellow portal.',
  },
  {
    q: 'How do I earn a certificate?',
    a: 'Complete required modules, assignments, quizzes, attendance thresholds, and capstone criteria defined for your cohort.',
  },
]

export default function FellowshipPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Program</p>
      <h1 className="mt-2 text-4xl font-bold text-slate-900">DAAI Fellowship Overview</h1>
      <p className="mt-4 max-w-3xl text-lg text-slate-600">
        The Data, Automation &amp; Artificial Intelligence Fellowship is CloudMandap&apos;s
        structured pathway into industry-ready cloud, Salesforce, and quality engineering
        skills—with mentor support, cohort accountability, and portfolio projects.
      </p>

      <section className="mt-12" id="pathways">
        <h2 className="text-2xl font-bold text-slate-900">Tracks &amp; pathways</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FELLOWSHIP_PATHWAYS.map((pathway) => (
            <PathwayCard key={pathway.slug} pathway={pathway} />
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Learning model</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-600">
            <li>Published modules and lessons in the fellow learning portal</li>
            <li>Live mentor sessions and office hours</li>
            <li>Assignments with structured review</li>
            <li>Track-aligned quizzes and progress tracking</li>
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Evaluation model</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-600">
            <li>Lesson completion and module checkpoints</li>
            <li>Assignment submissions and mentor feedback</li>
            <li>Quiz performance and attendance</li>
            <li>Capstone project review</li>
          </ul>
        </div>
      </section>

      <section className="mt-16" id="how-it-works">
        <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
        <ol className="mt-6 space-y-4">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <li key={step.step} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <span className="font-semibold text-indigo-600">Step {step.step}:</span>{' '}
              <span className="font-medium text-slate-900">{step.title}</span>
              <p className="mt-1 text-sm text-slate-600">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16" id="outcomes">
        <h2 className="text-2xl font-bold text-slate-900">Outcomes</h2>
        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {OUTCOMES.map((item) => (
            <li key={item} className="text-sm text-slate-700">
              • {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-bold text-slate-900">FAQ</h2>
        <dl className="mt-6 space-y-6">
          {FAQ.map((item) => (
            <div key={item.q}>
              <dt className="font-semibold text-slate-900">{item.q}</dt>
              <dd className="mt-2 text-sm text-slate-600">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-16 rounded-xl bg-indigo-50 p-8 text-center">
        <h2 className="text-xl font-bold text-slate-900">Ready to apply?</h2>
        <p className="mt-2 text-slate-600">Start your application for the next DAAI cohort.</p>
        <div className="mt-6">
          <Button to="/fellowship/apply">Apply Now</Button>
        </div>
      </div>
    </div>
  )
}
