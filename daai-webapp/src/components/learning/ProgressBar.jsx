export default function ProgressBar({ value }) {
  const normalizedValue = Math.max(0, Math.min(100, Number(value) || 0))

  return (
    <div className="h-3 overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-[#4f46e5] transition-all duration-300"
        style={{ width: `${normalizedValue}%` }}
      />
    </div>
  )
}
