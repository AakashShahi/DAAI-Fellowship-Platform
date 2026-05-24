import { getFellowTrackLabel } from '../../constants/fellowTracks'

export default function TrackBadge({ selectedTrack }) {
  const isSelected = Boolean(selectedTrack)

  return (
    <span
      className={[
        'inline-flex rounded-full border px-3 py-1 text-xs font-black',
        isSelected
          ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
          : 'border-slate-200 bg-slate-50 text-slate-600',
      ].join(' ')}
    >
      {getFellowTrackLabel(selectedTrack)}
    </span>
  )
}
