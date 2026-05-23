export default function ProgressBar({ value }) {
  const normalizedValue = Math.max(0, Math.min(100, Number(value) || 0))

  return (
    <div className="h-3 overflow-hidden rounded-full bg-orange-100">
      <div
        className="h-full rounded-full bg-[#f26322] transition-all duration-300"
        style={{ width: `${normalizedValue}%` }}
      />
    </div>
  )
}
