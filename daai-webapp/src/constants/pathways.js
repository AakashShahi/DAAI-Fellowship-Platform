/** Public fellowship pathway content (marketing site). */

export const PATHWAY_SLUGS = {
  AWS: 'aws-devops-cloud-engineering',
  SALESFORCE: 'salesforce-development',
  QA: 'qa-automation-engineering',
  DATA_AI: 'data-ai-engineering',
}

export const FELLOWSHIP_PATHWAYS = [
  {
    slug: PATHWAY_SLUGS.AWS,
    title: 'AWS DevOps and Cloud Engineering',
    shortDescription:
      'Build production-ready cloud skills with AWS services, CI/CD, infrastructure as code, and observability.',
    skills: ['AWS', 'Linux', 'Docker', 'Terraform', 'CI/CD', 'Monitoring'],
    duration: '12–16 weeks',
    heroTagline: 'Ship reliable cloud infrastructure like an engineering team.',
    whatYouLearn: [
      'AWS core services and well-architected principles',
      'Linux administration and shell automation',
      'Containers, orchestration basics, and deployment pipelines',
      'Infrastructure as code with Terraform',
      'Monitoring, logging, and incident response fundamentals',
    ],
    tools: ['AWS Console & CLI', 'Docker', 'GitHub Actions', 'Terraform', 'CloudWatch'],
    projects: [
      'Multi-tier VPC deployment',
      'CI/CD pipeline for a sample application',
      'Infrastructure-as-code capstone',
    ],
    weeklyFlow: [
      'Live mentor sessions and labs',
      'Hands-on AWS labs each week',
      'Module quizzes and checkpoint reviews',
      'Capstone project in final weeks',
    ],
    assessment: 'Module quizzes, lab checkpoints, assignments, and a capstone review.',
    careers: [
      'Cloud Engineer',
      'DevOps Engineer',
      'Platform / SRE Associate',
    ],
  },
  {
    slug: PATHWAY_SLUGS.SALESFORCE,
    title: 'Salesforce Development',
    shortDescription:
      'Learn Apex, Lightning Web Components, flows, and admin fundamentals for real CRM delivery.',
    skills: ['Apex', 'LWC', 'Flows', 'Data Model', 'Security', 'Agile Delivery'],
    duration: '12–16 weeks',
    heroTagline: 'Design and build solutions on the Salesforce platform.',
    whatYouLearn: [
      'Salesforce data model and security model',
      'Apex triggers, classes, and test coverage',
      'Lightning Web Components and UX patterns',
      'Flows, automation, and integration basics',
      'Agile delivery on CRM projects',
    ],
    tools: ['Salesforce DX', 'VS Code', 'Git', 'Postman', 'Trailhead-aligned labs'],
    projects: [
      'Custom object automation',
      'LWC business component',
      'End-to-end CRM feature capstone',
    ],
    weeklyFlow: [
      'Concept sessions + sandbox labs',
      'Peer code reviews',
      'Trailhead-aligned practice',
      'Sprint-style capstone delivery',
    ],
    assessment: 'Sandbox assignments, quizzes, and a reviewed capstone user story.',
    careers: [
      'Salesforce Developer',
      'Salesforce Administrator (with dev skills)',
      'CRM Consultant',
    ],
  },
  {
    slug: PATHWAY_SLUGS.QA,
    title: 'QA and Automation Engineering',
    shortDescription:
      'Master manual testing discipline, API testing, and test automation for modern web applications.',
    skills: ['Test Design', 'Selenium', 'API Testing', 'CI', 'Bug Reporting', 'Agile QA'],
    duration: '10–14 weeks',
    heroTagline: 'Deliver quality with structured testing and automation.',
    whatYouLearn: [
      'Test planning, cases, and traceability',
      'Functional and regression testing',
      'API testing with industry tools',
      'UI automation frameworks and patterns',
      'CI integration and quality metrics',
    ],
    tools: ['Postman', 'Selenium / Playwright-style stacks', 'Jira', 'Git', 'Test reporting'],
    projects: [
      'Test plan for a product slice',
      'API test suite',
      'Automation regression pack capstone',
    ],
    weeklyFlow: [
      'Exploratory and scripted testing labs',
      'Automation scripting sessions',
      'Defect triage workshops',
      'Capstone quality report',
    ],
    assessment: 'Test artifacts, automation deliverables, and peer-reviewed capstone.',
    careers: [
      'QA Engineer',
      'Test Automation Engineer',
      'Quality Analyst',
    ],
  },
  {
    slug: PATHWAY_SLUGS.DATA_AI,
    title: 'Data & AI Engineering',
    shortDescription:
      'Placeholder pathway for data pipelines, analytics, and applied AI/ML foundations (coming soon).',
    skills: ['Python', 'SQL', 'ETL', 'ML Basics', 'Cloud Data'],
    duration: 'Coming soon',
    heroTagline: 'Data platforms and applied AI for the modern enterprise.',
    whatYouLearn: [
      'Data modeling and SQL at scale',
      'ETL/ELT pipeline patterns',
      'Intro to ML workflows and MLOps concepts',
    ],
    tools: ['Python', 'SQL', 'Cloud data services'],
    projects: ['Pipeline capstone (planned)'],
    weeklyFlow: ['Structured modules when launched'],
    assessment: 'TBD',
    careers: ['Data Engineer', 'ML Engineer (associate)'],
    comingSoon: true,
  },
]

export const HOW_IT_WORKS_STEPS = [
  { step: 1, title: 'Apply', description: 'Submit your application and tell us about your goals.' },
  { step: 2, title: 'Track assignment', description: 'Get matched to AWS, Salesforce, QA, or a future data path.' },
  { step: 3, title: 'Join cohort', description: 'Start with peers, mentors, and a structured schedule.' },
  { step: 4, title: 'Learn modules', description: 'Progress through lessons, labs, and mentor sessions.' },
  { step: 5, title: 'Quizzes & assignments', description: 'Demonstrate skills with checkpoints and projects.' },
  { step: 6, title: 'Capstone', description: 'Build portfolio-ready work with mentor feedback.' },
  { step: 7, title: 'Certificate & career prep', description: 'Earn recognition and placement support where offered.' },
]

export const TRUST_CARDS = [
  {
    title: 'Hands-on Projects',
    description: 'Build real deliverables you can show employers—not slide-only learning.',
  },
  {
    title: 'Mentor-Led Learning',
    description: 'Guidance from practitioners who ship cloud, CRM, and quality systems.',
  },
  {
    title: 'Industry-Aligned Curriculum',
    description: 'Pathways shaped around CloudMandap’s data, cloud, and automation practice.',
  },
  {
    title: 'Career Readiness',
    description: 'Quizzes, assignments, attendance, and capstones that mirror workplace expectations.',
  },
]

export const OUTCOMES = [
  'Strong technical foundation in your chosen pathway',
  'Real project and lab experience',
  'Portfolio-ready capstone work',
  'Mentorship and cohort accountability',
  'Fellowship certificate upon completion criteria',
  'Career preparation and placement support where available',
]

export function getPathwayBySlug(slug) {
  return FELLOWSHIP_PATHWAYS.find((p) => p.slug === slug)
}
