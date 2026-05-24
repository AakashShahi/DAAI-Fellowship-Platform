import { Eye, MoreVertical, RefreshCcw, Trash2, UserX } from 'lucide-react'
import {
  FELLOW_TRACK_OPTIONS,
  getFellowTrackLabel,
} from '../../constants/fellowTracks'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/Dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/DropdownMenu'
import TrackBadge from './TrackBadge'

const formatDate = (value) => {
  if (!value) {
    return 'Unknown'
  }

  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function FellowsTable({
  fellows,
  selectedFellowProfile,
  isProfileLoading,
  isUpdating,
  currentPage,
  totalPages,
  showingStart,
  showingEnd,
  totalItems,
  onPageChange,
  onCloseProfile,
  onViewProfile,
  onChangeTrack,
  onResetTrack,
}) {
  if (totalItems === 0) {
    return (
      <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-bold text-[#475569]">
        No fellows match this filter.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-[#475569]">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Selected Track</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {fellows.map((fellow) => {
              return (
                <tr
                  key={fellow.id}
                  className="align-top transition-colors hover:bg-slate-50"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <AvatarInitials name={fellow.fullName} />
                      <div>
                        <p className="font-black text-[#0f172a]">
                          {fellow.fullName}
                        </p>
                        <p className="text-xs font-bold text-[#64748b]">
                          Joined fellow
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium text-[#475569]">
                    {fellow.email}
                  </td>
                  <td className="px-4 py-4">
                    <TrackBadge selectedTrack={fellow.selectedTrack} />
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={fellow.status ?? 'Active'} />
                  </td>
                  <td className="px-4 py-4 font-medium text-[#475569]">
                    {formatDate(fellow.createdAt)}
                  </td>
                  <td className="px-4 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-black text-[#475569] transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={isUpdating || isProfileLoading}
                          aria-label={`Open actions for ${fellow.fullName}`}
                        >
                          Actions
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-56">
                        <DropdownMenuItem onSelect={() => onViewProfile(fellow)}>
                          <Eye className="h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Change Track</DropdownMenuLabel>
                        {FELLOW_TRACK_OPTIONS.map((track) => (
                          <DropdownMenuItem
                            key={track.value}
                            disabled={isUpdating || fellow.selectedTrack === track.value}
                            onSelect={() =>
                              onChangeTrack(fellow, track.value, track.label)
                            }
                          >
                            {track.label}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          disabled={isUpdating || !fellow.selectedTrack}
                          onSelect={() => onResetTrack(fellow)}
                        >
                          <RefreshCcw className="h-4 w-4" />
                          Reset Track
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>
                          <UserX className="h-4 w-4" />
                          Suspend Fellow
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled className="text-red-700">
                          <Trash2 className="h-4 w-4" />
                          Delete Fellow
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#475569] sm:flex-row sm:items-center sm:justify-between">
        <p>
          Showing {showingStart}-{showingEnd} of {totalItems}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-200 px-3 py-2 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              type="button"
              className={[
                'h-9 w-9 rounded-md border text-sm font-black transition',
                page === currentPage
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-200 text-[#475569] hover:bg-slate-50',
              ].join(' ')}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            className="rounded-md border border-slate-200 px-3 py-2 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
      <FellowProfileDialog
        fellow={selectedFellowProfile}
        isOpen={Boolean(selectedFellowProfile)}
        onClose={onCloseProfile}
      />
    </div>
  )
}

function AvatarInitials({ name }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 text-sm font-black text-indigo-700">
      {initials || 'F'}
    </span>
  )
}

function StatusBadge({ status }) {
  const normalizedStatus = status.toLowerCase()
  const tone = normalizedStatus.includes('pending')
    ? 'border-amber-200 bg-amber-50 text-amber-700'
    : normalizedStatus.includes('suspend') || normalizedStatus.includes('inactive')
      ? 'border-red-200 bg-red-50 text-red-700'
      : normalizedStatus.includes('complete')
        ? 'border-blue-200 bg-blue-50 text-blue-700'
        : 'border-emerald-200 bg-emerald-50 text-emerald-700'

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${tone}`}>
      {status}
    </span>
  )
}

function formatPercent(value) {
  if (value === null || value === undefined) {
    return 'No attempts'
  }

  return `${value}%`
}

function SummaryRow({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-[#f8fafc] p-3">
      <dt className="text-xs font-black uppercase tracking-wide text-[#64748b]">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-black text-[#0f172a]">{value}</dd>
    </div>
  )
}

function FellowProfileDialog({ fellow, isOpen, onClose }) {
  const quiz = fellow?.quizProgress
  const submissions = fellow?.assignmentSubmissions
  const attendance = fellow?.attendance

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        {fellow ? (
          <>
            <DialogHeader>
              <DialogTitle>{fellow.fullName}</DialogTitle>
              <DialogDescription>{fellow.email}</DialogDescription>
            </DialogHeader>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <SummaryRow label="Selected Track" value={getFellowTrackLabel(fellow.selectedTrack)} />
              <SummaryRow label="Enrollment Status" value={fellow.enrollmentStatus} />
              <SummaryRow label="Account Status" value={fellow.status ?? 'Active'} />
              <SummaryRow label="Joined Date" value={formatDate(fellow.createdAt)} />
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <section className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-black text-[#0f172a]">Quiz Progress</h3>
                <dl className="mt-3 space-y-2 text-sm font-bold text-[#475569]">
                  <div className="flex justify-between gap-3">
                    <dt>Attempts</dt>
                    <dd>{quiz?.attempts ?? 0}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Best Score</dt>
                    <dd>{formatPercent(quiz?.bestScore)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Average</dt>
                    <dd>{formatPercent(quiz?.averageScore)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Last Attempt</dt>
                    <dd>{formatDate(quiz?.lastAttemptAt)}</dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-black text-[#0f172a]">Assignment Submissions</h3>
                <dl className="mt-3 space-y-2 text-sm font-bold text-[#475569]">
                  <div className="flex justify-between gap-3">
                    <dt>Total</dt>
                    <dd>{submissions?.total ?? 0}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Reviewed</dt>
                    <dd>{submissions?.reviewed ?? 0}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Pending Review</dt>
                    <dd>{submissions?.pendingReview ?? 0}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Needs Revision</dt>
                    <dd>{submissions?.needsRevision ?? 0}</dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-black text-[#0f172a]">Attendance</h3>
                <dl className="mt-3 space-y-2 text-sm font-bold text-[#475569]">
                  <div className="flex justify-between gap-3">
                    <dt>Rate</dt>
                    <dd>{attendance?.attendanceRate ?? 0}%</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Present</dt>
                    <dd>{attendance?.present ?? 0}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Late</dt>
                    <dd>{attendance?.late ?? 0}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Absent</dt>
                    <dd>{attendance?.absent ?? 0}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Excused</dt>
                    <dd>{attendance?.excused ?? 0}</dd>
                  </div>
                </dl>
              </section>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
