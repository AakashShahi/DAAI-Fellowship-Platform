export const ASSIGNMENT_STATUS_VALUES = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
}

export const ASSIGNMENT_STATUS_LABELS = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
}

export const ASSIGNMENT_STATUS_OPTIONS = Object.values(ASSIGNMENT_STATUS_VALUES).map(
  (value) => ({ value, label: ASSIGNMENT_STATUS_LABELS[value] }),
)

export const SUBMISSION_TYPE_OPTIONS = [
  { value: 'text', label: 'Text' },
  { value: 'link', label: 'Link' },
  { value: 'file-link', label: 'File Link' },
  { value: 'github-link', label: 'GitHub Link' },
  { value: 'mixed', label: 'Mixed' },
]

export const SUBMISSION_STATUS_LABELS = {
  'not-submitted': 'Not Submitted',
  submitted: 'Submitted',
  'under-review': 'Under Review',
  reviewed: 'Reviewed',
  'needs-resubmission': 'Needs Resubmission',
}

export const REVIEW_STATUS_OPTIONS = [
  { value: 'under-review', label: 'Under Review' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'needs-resubmission', label: 'Needs Resubmission' },
]

export const getAssignmentStatusLabel = (status) =>
  ASSIGNMENT_STATUS_LABELS[status] ?? status

export const getSubmissionStatusLabel = (status) =>
  SUBMISSION_STATUS_LABELS[status] ?? 'Not Submitted'
