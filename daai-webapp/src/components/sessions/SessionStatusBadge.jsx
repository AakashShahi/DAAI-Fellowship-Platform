import { getSessionStatusLabel } from '../../constants/sessions'

const styles = {
  scheduled: 'bg-blue-50 text-blue-700 border-blue-100',
  completed: 'bg-green-50 text-green-700 border-green-100',
  cancelled: 'bg-red-50 text-red-700 border-red-100',
  archived: 'bg-stone-100 text-stone-600 border-stone-200',
}

export default function SessionStatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${styles[status] ?? styles.archived}`}>
      {getSessionStatusLabel(status)}
    </span>
  )
}
