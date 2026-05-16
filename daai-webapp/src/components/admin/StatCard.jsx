export default function StatCard({ label, value, helper, action }) {
  return (
    <article className="rounded-lg border border-orange-100 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
      <p className="text-sm font-bold text-[#6f5f57]">{label}</p>
      <p className="mt-3 text-4xl font-black text-[#24140e]">{value}</p>
      {helper ? <p className="mt-2 text-sm font-medium text-[#6f5f57]">{helper}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </article>
  )
}
