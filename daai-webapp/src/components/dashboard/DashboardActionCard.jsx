import { Link } from 'react-router-dom'

export default function DashboardActionCard({
  title,
  description,
  to,
  cta,
  status,
  disabled = false,
}) {
  const content = (
    <>
      <div>
        <span>{title}</span>
        <p>{description}</p>
      </div>
      <div className="dashboard-card-footer">
        <small>{status}</small>
        <strong>{cta}</strong>
      </div>
    </>
  )

  if (disabled) {
    return (
      <article className="dashboard-action-card is-disabled" aria-disabled="true">
        {content}
      </article>
    )
  }

  return (
    <Link className="dashboard-action-card" to={to}>
      {content}
    </Link>
  )
}
