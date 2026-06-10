import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-slate-900">About DAAI Fellowship</h1>
      <p className="mt-4 max-w-3xl text-lg text-slate-600">
        DAAI — Data, Automation &amp; Artificial Intelligence — is CloudMandap&apos;s fellowship
        brand for building job-ready talent in cloud, CRM, quality engineering, and emerging
        data platforms.
      </p>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">CloudMandap</h2>
          <p className="mt-3 text-sm text-slate-600">
            CloudMandap delivers data engineering, cloud, DevOps, AI/ML, digital transformation,
            managed services, skill labs, and fellowship programs. DAAI extends that mission into
            structured cohort learning with mentors and real projects.
          </p>
          <a
            href="https://www.cloudmandap.com/"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:underline"
          >
            Visit cloudmandap.com →
          </a>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Our approach</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>Cohort-based learning with accountability</li>
            <li>Industry-aligned modules, quizzes, and assignments</li>
            <li>Mentor feedback and session-based instruction</li>
            <li>Portfolio capstones and certificate criteria</li>
          </ul>
        </Card>
      </div>

      <div className="mt-12">
        <Button to="/fellowship/apply">Apply to DAAI</Button>
      </div>
    </div>
  )
}
