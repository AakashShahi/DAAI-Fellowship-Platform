import { Link } from 'react-router-dom'
import {
  Award,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Cloud,
  Code2,
  GraduationCap,
  Layers3,
  MonitorCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import {
  FELLOWSHIP_PATHWAYS,
  HOW_IT_WORKS_STEPS,
  OUTCOMES,
} from '../../constants/pathways'

const heroStats = [
  { label: '12-16 weeks', helper: 'Structured cohort learning', icon: CalendarDays },
  { label: '4 learning tracks', helper: 'Cloud, Salesforce, QA, Data/AI', icon: Layers3 },
  { label: 'Mentor-led', helper: 'Guidance and project review', icon: Users },
  { label: 'Certificate included', helper: 'Earned through completion', icon: Award },
]

const highlights = [
  { title: 'Cohort-based learning', icon: Users },
  { title: 'Mentor support', icon: GraduationCap },
  { title: 'Portfolio projects', icon: BriefcaseBusiness },
  { title: 'Certificate pathway', icon: Award },
]

const benefits = [
  {
    title: 'Mentor-guided learning',
    description: 'Learn with practitioner guidance, feedback, and cohort accountability.',
    icon: Users,
  },
  {
    title: 'Project-based curriculum',
    description: 'Build labs, assignments, and capstone work that reflects workplace tasks.',
    icon: BriefcaseBusiness,
  },
  {
    title: 'Progress tracking',
    description: 'Track lessons, quizzes, assignments, attendance, and certificate readiness.',
    icon: Target,
  },
  {
    title: 'Career preparation',
    description: 'Practice industry workflows and prepare for internship or associate roles.',
    icon: GraduationCap,
  },
]

const pathwayIcons = {
  'AWS DevOps and Cloud Engineering': Cloud,
  'Salesforce Development': Code2,
  'QA and Automation Engineering': MonitorCheck,
  'Data & AI Engineering': Sparkles,
}

const modelCards = [
  {
    title: 'Learning model',
    items: [
      'Published modules and lessons',
      'Live mentor sessions and office hours',
      'Assignments with structured review',
      'Track-aligned quizzes and progress tracking',
    ],
  },
  {
    title: 'Evaluation model',
    items: [
      'Lesson completion and module checkpoints',
      'Assignment submissions and mentor feedback',
      'Quiz performance and attendance',
      'Capstone project review',
    ],
  },
]

const landingSteps = [
  'Apply',
  'Track assignment',
  'Join cohort',
  'Learn modules',
  'Quizzes & assignments',
  'Certificate',
]

const faqItems = [
  {
    q: 'Who should apply?',
    a: 'Students, career switchers, and early professionals ready for intensive hands-on learning in cloud, CRM, QA, or future Data/AI tracks.',
  },
  {
    q: 'How are tracks assigned?',
    a: 'You may indicate a preferred pathway during application. Final placement considers aptitude, cohort capacity, and program fit.',
  },
  {
    q: 'Is the program remote?',
    a: 'Cohorts may run hybrid or remote depending on schedule. Sessions, modules, assignments, and progress are available in the fellow portal.',
  },
  {
    q: 'How do I earn a certificate?',
    a: 'Complete required modules, assignments, quizzes, attendance thresholds, and capstone criteria defined for your cohort.',
  },
]

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow ? (
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
      ) : null}
    </div>
  )
}

function IconCircle({ icon: Icon }) {
  return (
    <span className="grid h-11 w-11 place-items-center rounded-full bg-indigo-50 text-indigo-700">
      <Icon className="h-5 w-5" />
    </span>
  )
}

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-white via-slate-50 to-violet-50/60">
        <div className="pointer-events-none absolute -right-24 top-12 h-56 w-56 rounded-full bg-indigo-200/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-56 w-56 rounded-full bg-purple-100/50 blur-3xl" />
        <div className="relative mx-auto grid min-w-0 max-w-7xl grid-cols-1 items-center gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:grid-cols-2 lg:px-8 lg:py-4">
          <div className="min-w-0 max-w-2xl">
            <span className="mb-4 inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-700">
              DAAI Fellowship Program
            </span>
            <h1 className="max-w-full break-words text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-5xl">
              Build industry-ready skills in Cloud, Salesforce, QA, and Data/AI
            </h1>
            <p className="mt-4 max-w-xl break-words text-base leading-7 text-slate-600 sm:text-lg">
              A structured fellowship with mentor support, cohort accountability,
              hands-on projects, quizzes, assignments, and certification.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/fellowship/apply" size="lg">
                Apply Now
              </Button>
              <Button to="/fellowship#pathways" variant="secondary" size="lg">
                Explore Tracks
              </Button>
            </div>
          </div>

          <div className="min-w-0 w-full max-w-xl justify-self-center lg:justify-self-end">
            <Card
              padding={false}
              className="relative min-w-0 overflow-hidden border-indigo-100 bg-white/90 p-4 shadow-xl shadow-indigo-100/50"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-indigo-600">Program Preview</p>
                  <h2 className="mt-1 text-xl font-bold leading-tight tracking-tight text-slate-900">
                    Your fellowship roadmap
                  </h2>
                </div>
                <IconCircle icon={BookOpen} />
              </div>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {heroStats.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.label} className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2.5">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-50 text-indigo-700">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <p className="text-sm font-bold text-slate-900">{stat.label}</p>
                        <p className="mt-0.5 text-xs leading-5 text-slate-600">{stat.helper}</p>
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-3">
                <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
                  <span>Learning journey</span>
                  <span>65%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full w-[65%] rounded-full bg-indigo-600" />
                </div>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {['Join cohort', 'Complete modules', 'Submit capstone'].map((item, index) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2
                        className={index < 2 ? 'h-4 w-4 text-emerald-600' : 'h-4 w-4 text-slate-300'}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-6">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {highlights.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-indigo-50 text-indigo-700">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="text-sm font-semibold text-slate-800">{item.title}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Why DAAI"
            title="Why fellows choose DAAI"
            description="A focused learning experience built for practical skills, visible progress, and cohort momentum."
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="h-full transition hover:-translate-y-1 hover:shadow-md">
                <IconCircle icon={benefit.icon} />
                <h3 className="mt-5 text-lg font-bold text-slate-900">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="pathways" className="bg-gradient-to-br from-slate-50 to-indigo-50/40 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Tracks"
            title="Tracks & pathways"
            description="Choose a guided pathway aligned with cloud engineering, Salesforce delivery, QA automation, or future Data/AI foundations."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {FELLOWSHIP_PATHWAYS.map((pathway) => {
              const Icon = pathwayIcons[pathway.title] ?? BookOpen
              return (
                <Card
                  key={pathway.slug}
                  className={[
                    'flex h-full flex-col transition hover:-translate-y-1 hover:shadow-md',
                    pathway.comingSoon ? 'opacity-75' : '',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <IconCircle icon={Icon} />
                    {pathway.comingSoon ? <Badge tone="warning">Coming soon</Badge> : null}
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-slate-900">{pathway.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
                    {pathway.shortDescription}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {pathway.skills.slice(0, 4).map((skill) => (
                      <Badge key={skill} tone="primary">{skill}</Badge>
                    ))}
                  </div>
                  <p className="mt-5 text-sm font-semibold text-slate-700">
                    Duration: {pathway.duration}
                  </p>
                  <div className="mt-auto pt-5">
                    {pathway.comingSoon ? (
                      <Button variant="secondary" disabled className="w-full opacity-70">
                        View pathway
                      </Button>
                    ) : (
                      <Button to={`/fellowship/${pathway.slug}`} variant="secondary" className="w-full">
                        View pathway
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {modelCards.map((model) => (
              <Card key={model.title} className="h-full">
                <h2 className="text-2xl font-bold text-slate-900">{model.title}</h2>
                <ul className="mt-6 space-y-4">
                  {model.items.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-slate-50 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Process"
            title="How it works"
            description="From application to certification, each step is structured so fellows always know what comes next."
          />
          <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {landingSteps.map((title, index) => {
              const step = HOW_IT_WORKS_STEPS[index]
              return (
                <li key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {step?.description ?? 'Complete the next program milestone with mentor guidance.'}
                  </p>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      <section id="outcomes" className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Outcomes"
            title="What you will gain"
            description="Finish with measurable progress, practical work, and clearer readiness for industry roles."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {OUTCOMES.map((outcome) => (
              <div key={outcome} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <p className="text-sm font-medium leading-6 text-slate-700">{outcome}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="FAQ" title="Common questions" />
          <div className="mt-8 space-y-3">
            {faqItems.map((item) => (
              <details key={item.q} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-bold text-slate-900">
                  {item.q}
                  <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="apply" className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 px-6 py-12 text-center shadow-sm sm:px-10">
            <h2 className="text-3xl font-bold text-slate-900">
              Ready to start your fellowship journey?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Join the next DAAI cohort and build practical, portfolio-ready skills with mentor guidance.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button to="/fellowship/apply" size="lg">Apply Now</Button>
              <Button to="/login" variant="secondary" size="lg">Login to Portal</Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
