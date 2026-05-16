export const COHORT_STATUS_VALUES = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
}

export const COHORT_STATUS_LABELS = {
  [COHORT_STATUS_VALUES.UPCOMING]: 'Upcoming',
  [COHORT_STATUS_VALUES.ACTIVE]: 'Active',
  [COHORT_STATUS_VALUES.COMPLETED]: 'Completed',
  [COHORT_STATUS_VALUES.ARCHIVED]: 'Archived',
}

export const COHORT_STATUS_OPTIONS = Object.values(COHORT_STATUS_VALUES).map(
  (value) => ({
    value,
    label: COHORT_STATUS_LABELS[value],
  }),
)

export const ADMIN_COHORT_STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...COHORT_STATUS_OPTIONS,
]

export const getCohortStatusLabel = (status) =>
  COHORT_STATUS_LABELS[status] ?? 'Unknown'
