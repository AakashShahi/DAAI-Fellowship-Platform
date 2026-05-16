import { getFellowTrackLabel } from '../../constants/fellowTracks'

export default function TrackBadge({ selectedTrack }) {
  const isSelected = Boolean(selectedTrack)

  return (
    <span
      className={[
        'inline-flex rounded-full px-3 py-1 text-xs font-black',
        isSelected
          ? 'bg-[#fff1e8] text-[#f26322]'
          : 'bg-slate-100 text-slate-600',
      ].join(' ')}
    >
      {getFellowTrackLabel(selectedTrack)}
    </span>
  )
}
