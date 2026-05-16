export default function StatCard({ label, value, helper, action, trend }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      {helper ? <p className="mt-1 text-sm text-slate-600">{helper}</p> : null}
      {trend ? <p className="mt-1 text-xs font-medium text-indigo-600">{trend}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </article>
  )
}
