import { ADMIN_TRACK_FILTER_OPTIONS } from '../../constants/fellowTracks'

export default function TrackFilter({ value, onChange, disabled = false }) {
  return (
    <label className="grid gap-2 text-sm font-black text-[#24140e] sm:max-w-xs">
      Track Filter
      <select
        className="rounded-md border border-orange-100 bg-white px-3 py-2 text-sm font-bold text-[#6f5f57] outline-none transition focus:border-[#f26322]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        {ADMIN_TRACK_FILTER_OPTIONS.map((option) => (
          <option key={option.value || 'all'} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
