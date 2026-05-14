import { Link } from 'react-router-dom'

const getStatus = (progress) => {
  if (progress >= 100) {
    return 'Completed'
  }

  if (progress > 0) {
    return 'In Progress'
  }

  return 'Not Started'
}

export default function TrackProgressCard({
  name,
  description,
  progress = 0,
  to = '/quizzes',
}) {
  const normalizedProgress = Math.min(Math.max(progress, 0), 100)
  const status = getStatus(normalizedProgress)

  return (
    <article className="track-progress-card">
      <div className="track-card-heading">
        <div>
          <h3>{name}</h3>
          <p>{description}</p>
        </div>
        <span>{status}</span>
      </div>

      <div className="track-progress-bar" aria-label={`${name} progress`}>
        <span style={{ width: `${normalizedProgress}%` }} />
      </div>

      <div className="track-card-footer">
        <strong>{normalizedProgress}%</strong>
        <Link to={to}>{normalizedProgress > 0 ? 'Continue' : 'Start'}</Link>
      </div>
    </article>
  )
}
