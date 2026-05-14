export default function DashboardStatCard({ label, value, helper }) {
  return (
    <article className="fellow-stat-card">
      <p>{label}</p>
      <strong>{value}</strong>
      {helper ? <span>{helper}</span> : null}
    </article>
  )
}
