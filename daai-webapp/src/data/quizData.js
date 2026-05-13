export const quizCategories = [
  {
    slug: 'qa',
    title: 'QA',
    description: 'Manual testing, bug reports, test cases, and quality basics.',
  },
  {
    slug: 'salesforce',
    title: 'Salesforce',
    description: 'CRM fundamentals, objects, records, automation, and platform basics.',
  },
  {
    slug: 'aws-practitioner',
    title: 'AWS Practitioner',
    description: 'Cloud concepts, billing, security, and core AWS services.',
  },
  {
    slug: 'aws-solutions-architect',
    title: 'AWS Solutions Architect',
    description: 'Architecture patterns, resilience, networking, storage, and compute.',
  },
]

export const quizzes = {
  qa: {
    title: 'QA',
    questions: [
      {
        id: 'qa-1',
        question: 'What is the main purpose of a test case?',
        options: [
          'To describe how a feature should be verified',
          'To deploy code to production',
          'To replace user documentation',
          'To design the database schema',
        ],
        correctAnswer: 'To describe how a feature should be verified',
      },
      {
        id: 'qa-2',
        question: 'Which item is most useful in a bug report?',
        options: [
          'Steps to reproduce the issue',
          'The developer salary',
          'The company logo',
          'The number of meetings held',
        ],
        correctAnswer: 'Steps to reproduce the issue',
      },
      {
        id: 'qa-3',
        question: 'Regression testing checks whether:',
        options: [
          'Existing functionality still works after changes',
          'The application has a new logo',
          'The server is physically secure',
          'Only new features work',
        ],
        correctAnswer: 'Existing functionality still works after changes',
      },
    ],
  },
  salesforce: {
    title: 'Salesforce',
    questions: [
      {
        id: 'sf-1',
        question: 'In Salesforce, what is an object?',
        options: [
          'A database table-like structure for storing records',
          'A browser extension',
          'A network firewall',
          'A billing invoice only',
        ],
        correctAnswer: 'A database table-like structure for storing records',
      },
      {
        id: 'sf-2',
        question: 'Which Salesforce feature is commonly used for automation?',
        options: ['Flow', 'Canvas size', 'DNS zone', 'AMI'],
        correctAnswer: 'Flow',
      },
      {
        id: 'sf-3',
        question: 'A lead usually represents:',
        options: [
          'A potential customer or prospect',
          'A completed payment',
          'A storage bucket',
          'An operating system patch',
        ],
        correctAnswer: 'A potential customer or prospect',
      },
    ],
  },
  'aws-practitioner': {
    title: 'AWS Practitioner',
    questions: [
      {
        id: 'awsp-1',
        question: 'Which AWS service provides object storage?',
        options: ['Amazon S3', 'Amazon EC2', 'AWS IAM', 'Amazon Route 53'],
        correctAnswer: 'Amazon S3',
      },
      {
        id: 'awsp-2',
        question: 'What does IAM primarily manage?',
        options: [
          'Users, groups, roles, and permissions',
          'Physical data center cooling',
          'Source code formatting',
          'Domain name registration only',
        ],
        correctAnswer: 'Users, groups, roles, and permissions',
      },
      {
        id: 'awsp-3',
        question: 'Which pricing model lets you pay for compute by usage?',
        options: ['On-Demand', 'Handwritten invoice', 'Static license', 'Manual billing only'],
        correctAnswer: 'On-Demand',
      },
    ],
  },
  'aws-solutions-architect': {
    title: 'AWS Solutions Architect',
    questions: [
      {
        id: 'awssa-1',
        question: 'What improves high availability for an application?',
        options: [
          'Deploying across multiple Availability Zones',
          'Using one server in one rack',
          'Removing backups',
          'Disabling health checks',
        ],
        correctAnswer: 'Deploying across multiple Availability Zones',
      },
      {
        id: 'awssa-2',
        question: 'Which service distributes traffic across targets?',
        options: [
          'Elastic Load Balancing',
          'AWS CloudTrail',
          'Amazon S3 Glacier',
          'AWS Budgets',
        ],
        correctAnswer: 'Elastic Load Balancing',
      },
      {
        id: 'awssa-3',
        question: 'A private subnet normally contains resources that:',
        options: [
          'Are not directly reachable from the public internet',
          'Must have public IP addresses',
          'Cannot communicate with any resource',
          'Only store static images',
        ],
        correctAnswer: 'Are not directly reachable from the public internet',
      },
    ],
  },
}

export const getQuizByCategory = (category) => quizzes[category]

