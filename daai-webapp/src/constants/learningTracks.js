import { FELLOW_TRACK_VALUES } from './fellowTracks'

export const LEARNING_TRACKS = {
  QA: {
    value: 'QA',
    selectedTrack: FELLOW_TRACK_VALUES.QA,
    iconText: 'QA',
    label: 'QA',
    title: 'QA Fellowship Track',
    detailPath: '/fellow/learning-tracks/qa',
    quizPath: '/fellow/quizzes/qa',
    quizSlug: 'qa',
    categoryKeywords: ['qa', 'quality'],
    description: 'Practice testing foundations, quality process, and tools.',
    skills: ['Manual testing', 'Bug reporting', 'Test cases', 'QA process'],
    modules: [
      'Testing fundamentals',
      'Writing test cases',
      'Bug reporting workflow',
      'Regression and smoke testing',
    ],
    pathLabel: 'Beginner Friendly',
  },
  SALESFORCE: {
    value: 'SALESFORCE',
    selectedTrack: FELLOW_TRACK_VALUES.SALESFORCE,
    iconText: 'SF',
    label: 'Salesforce',
    title: 'Salesforce Fellowship Track',
    detailPath: '/fellow/learning-tracks/salesforce',
    quizPath: '/fellow/quizzes/salesforce',
    quizSlug: 'salesforce',
    categoryKeywords: ['salesforce'],
    description: 'Build confidence with CRM concepts and platform workflows.',
    skills: ['CRM basics', 'Objects', 'Automation', 'Admin workflows'],
    modules: [
      'CRM and Salesforce basics',
      'Objects, fields, and records',
      'User management basics',
      'Automation and reporting overview',
    ],
    pathLabel: 'CRM Track',
  },
  AWS_PRACTITIONER: {
    value: 'AWS_PRACTITIONER',
    selectedTrack: FELLOW_TRACK_VALUES.AWS_PRACTITIONER,
    iconText: 'AWS',
    label: 'AWS Practitioner',
    title: 'AWS Practitioner Track',
    detailPath: '/fellow/learning-tracks/aws-practitioner',
    quizPath: '/fellow/quizzes/aws-practitioner',
    quizSlug: 'aws-practitioner',
    categoryKeywords: ['aws practitioner', 'practitioner'],
    description: 'Review core cloud, pricing, support, and security concepts.',
    skills: ['Cloud basics', 'Billing', 'Security', 'AWS services'],
    modules: [
      'Cloud concepts',
      'AWS core services',
      'Security and shared responsibility',
      'Billing, pricing, and support',
    ],
    pathLabel: 'Cloud Track',
  },
  AWS_ARCHITECT: {
    value: 'AWS_ARCHITECT',
    selectedTrack: FELLOW_TRACK_VALUES.AWS_ARCHITECT,
    iconText: 'ARC',
    label: 'AWS Architect',
    title: 'AWS Architect Track',
    detailPath: '/fellow/learning-tracks/aws-architect',
    quizPath: '/fellow/quizzes/aws-architect',
    quizSlug: 'aws-architect',
    categoryKeywords: ['aws architect', 'architect'],
    description: 'Prepare for architecture patterns and cloud design choices.',
    skills: ['Architecture', 'Networking', 'Resilience', 'Design patterns'],
    modules: [
      'Architecture design principles',
      'Networking and connectivity',
      'High availability and resilience',
      'Storage, compute, and database choices',
    ],
    pathLabel: 'Advanced Cloud Track',
  },
}

export const LEARNING_TRACK_OPTIONS = Object.values(LEARNING_TRACKS)

export const LEARNING_TRACKS_BY_SLUG = LEARNING_TRACK_OPTIONS.reduce(
  (tracksBySlug, track) => ({
    ...tracksBySlug,
    [track.quizSlug]: track,
  }),
  {},
)
