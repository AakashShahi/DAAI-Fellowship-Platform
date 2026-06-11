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

  // Removing strict track filtering to allow assigning any enrolled fellow
  const eligibleFellows = fellows

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
        <div className="border-b border-slate-200 p-5">
          <p className="text-xs font-black uppercase tracking-wide text-[#4f46e5]">
            Assign Fellows
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#0f172a]">
            {cohort.name}
          </h2>
          <div className="mt-3">
            <TrackBadge selectedTrack={cohort.track} />
          </div>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-5">
          {eligibleFellows.length === 0 ? (
            <p className="rounded-lg border border-slate-200 bg-[#f8fafc] p-4 text-sm font-bold text-[#475569]">
              No eligible fellows found for this track.
            </p>
          ) : (
            <div className="grid gap-3">
              {eligibleFellows.map((fellow) => (
                <label
                  key={fellow.id}
                  className="flex items-start gap-3 rounded-lg border border-slate-200 p-4"
                >
                  <input
                    className="mt-1"
                    type="checkbox"
                    checked={selectedIds.has(fellow.id)}
                    onChange={() => toggleFellow(fellow.id)}
                  />
                  <span>
                    <strong className="block text-[#0f172a]">{fellow.fullName}</strong>
                    <small className="block text-sm font-medium text-[#475569]">
                      {fellow.email}
                    </small>
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="min-h-10 rounded-md border border-slate-200 px-4 text-sm font-black text-[#4f46e5] transition hover:bg-[#eef2ff]"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="min-h-10 rounded-md bg-[#4f46e5] px-4 text-sm font-black text-white transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60"
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
