import { useState } from 'react'
import {
  FELLOW_TRACK_OPTIONS,
  getFellowTrackLabel,
} from '../../constants/fellowTracks'
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
  isUpdating,
  onChangeTrack,
  onResetTrack,
}) {
  const [selectedTracks, setSelectedTracks] = useState({})

  const handleSelectionChange = (fellowId, value) => {
    setSelectedTracks((current) => ({
      ...current,
      [fellowId]: value,
    }))
  }

  if (fellows.length === 0) {
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
          <thead className="bg-[#f8fafc] text-xs font-black uppercase tracking-wide text-[#475569]">
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
              const selectedValue =
                selectedTracks[fellow.id] ?? fellow.selectedTrack ?? ''
              const hasChanged = selectedValue !== (fellow.selectedTrack ?? '')

              return (
                <tr key={fellow.id} className="align-top">
                  <td className="px-4 py-4 font-black text-[#0f172a]">
                    {fellow.fullName}
                  </td>
                  <td className="px-4 py-4 font-medium text-[#475569]">
                    {fellow.email}
                  </td>
                  <td className="px-4 py-4">
                    <TrackBadge selectedTrack={fellow.selectedTrack} />
                  </td>
                  <td className="px-4 py-4 font-bold text-[#475569]">
                    {fellow.status ?? 'Active'}
                  </td>
                  <td className="px-4 py-4 font-medium text-[#475569]">
                    {formatDate(fellow.createdAt)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex min-w-[260px] flex-wrap gap-2">
                      <select
                        className="min-h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-[#475569] outline-none focus:border-[#4f46e5]"
                        value={selectedValue}
                        onChange={(event) =>
                          handleSelectionChange(fellow.id, event.target.value)
                        }
                        disabled={isUpdating}
                        aria-label={`Select track for ${fellow.fullName}`}
                      >
                        <option value="">Not Selected</option>
                        {FELLOW_TRACK_OPTIONS.map((track) => (
                          <option key={track.value} value={track.value}>
                            {track.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="min-h-10 rounded-md bg-[#4f46e5] px-3 text-sm font-black text-white transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isUpdating || !selectedValue || !hasChanged}
                        onClick={() =>
                          onChangeTrack(
                            fellow,
                            selectedValue,
                            getFellowTrackLabel(selectedValue),
                          )
                        }
                      >
                        Change Track
                      </button>
                      <button
                        type="button"
                        className="min-h-10 rounded-md border border-red-200 bg-red-50 px-3 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isUpdating || !fellow.selectedTrack}
                        onClick={() => onResetTrack(fellow)}
                      >
                        Reset Track
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
