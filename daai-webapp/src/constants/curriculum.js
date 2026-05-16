export const MODULE_STATUS_VALUES = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
}

export const MODULE_STATUS_LABELS = {
  [MODULE_STATUS_VALUES.DRAFT]: 'Draft',
  [MODULE_STATUS_VALUES.PUBLISHED]: 'Published',
  [MODULE_STATUS_VALUES.ARCHIVED]: 'Archived',
}

export const MODULE_STATUS_OPTIONS = Object.values(MODULE_STATUS_VALUES).map(
  (value) => ({ value, label: MODULE_STATUS_LABELS[value] }),
)

export const RESOURCE_TYPE_OPTIONS = [
  { value: 'article', label: 'Article' },
  { value: 'video', label: 'Video' },
  { value: 'document', label: 'Document' },
  { value: 'external', label: 'External' },
  { value: 'assignment', label: 'Assignment' },
]

export const PROGRESS_STATUS_VALUES = {
  NOT_STARTED: 'not-started',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
}

export const getModuleStatusLabel = (status) =>
  MODULE_STATUS_LABELS[status] ?? 'Unknown'
