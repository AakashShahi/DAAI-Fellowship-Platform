export const SESSION_STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'archived', label: 'Archived' },
]

export const ATTENDANCE_STATUS_OPTIONS = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'excused', label: 'Excused' },
]

export const ATTENDANCE_STATUS_LABELS = {
  'not-marked': 'Not Marked',
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  excused: 'Excused',
}

export const getSessionStatusLabel = (status) =>
  SESSION_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status

export const getAttendanceStatusLabel = (status) =>
  ATTENDANCE_STATUS_LABELS[status] ?? status
