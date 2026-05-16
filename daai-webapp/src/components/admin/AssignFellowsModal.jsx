import { useMemo, useState } from 'react'
import TrackBadge from './TrackBadge'

export default function AssignFellowsModal({
  cohort,
  fellows,
  onClose,
  onSave,
  isSaving,
}) {
  const initialSelectedIds = useMemo(
    () => new Set(cohort.fellows ?? []),
    [cohort.fellows],
  )
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds)

  const eligibleFellows = fellows.filter(
    (fellow) => fellow.selectedTrack === cohort.track,
  )

  const toggleFellow = (fellowId) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(fellowId)) {
        next.delete(fellowId)
      } else {
        next.add(fellowId)
      }
      return next
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <section className="max-h-[86vh] w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="border-b border-orange-100 p-5">
          <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
            Assign Fellows
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#24140e]">
            {cohort.name}
          </h2>
          <div className="mt-3">
            <TrackBadge selectedTrack={cohort.track} />
          </div>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-5">
          {eligibleFellows.length === 0 ? (
            <p className="rounded-lg border border-orange-100 bg-[#fff8f3] p-4 text-sm font-bold text-[#6f5f57]">
              No fellows have selected this track yet.
            </p>
          ) : (
            <div className="grid gap-3">
              {eligibleFellows.map((fellow) => (
                <label
                  key={fellow.id}
                  className="flex items-start gap-3 rounded-lg border border-orange-100 p-4"
                >
                  <input
                    className="mt-1"
                    type="checkbox"
                    checked={selectedIds.has(fellow.id)}
                    onChange={() => toggleFellow(fellow.id)}
                  />
                  <span>
                    <strong className="block text-[#24140e]">{fellow.fullName}</strong>
                    <small className="block text-sm font-medium text-[#6f5f57]">
                      {fellow.email}
                    </small>
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-orange-100 p-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="min-h-10 rounded-md border border-orange-100 px-4 text-sm font-black text-[#f26322] transition hover:bg-[#fff1e8]"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="min-h-10 rounded-md bg-[#f26322] px-4 text-sm font-black text-white transition hover:bg-[#d94f13] disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => onSave([...selectedIds])}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Assignments'}
          </button>
        </div>
      </section>
    </div>
  )
}
