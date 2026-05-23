import { getAttendanceStatusLabel } from '../../constants/sessions'

const styles = {
  'not-marked': 'bg-stone-100 text-stone-600 border-stone-200',
  present: 'bg-green-50 text-green-700 border-green-100',
  absent: 'bg-red-50 text-red-700 border-red-100',
  late: 'bg-amber-50 text-amber-700 border-amber-100',
  excused: 'bg-blue-50 text-blue-700 border-blue-100',
}

export default function AttendanceStatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${styles[status] ?? styles['not-marked']}`}>
      {getAttendanceStatusLabel(status)}
    </span>
  )
}
