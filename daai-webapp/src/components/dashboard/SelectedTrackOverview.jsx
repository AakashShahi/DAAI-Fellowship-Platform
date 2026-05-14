import { Link } from 'react-router-dom'

export default function SelectedTrackOverview({
  track,
  attemptsCount,
  bestScore,
  averageScore,
  latestAttempt,
  latestPercentage,
}) {
  return (
    <section className="selected-track-overview">
      <div>
        <span>{track.pathLabel}</span>
        <h2>{track.title}</h2>
        <p>{track.description}</p>
      </div>

      <div className="selected-track-progress">
        <div>
          <strong>{averageScore}%</strong>
          <span>Average score</span>
        </div>
        <div className="track-progress-bar" aria-label={`${track.label} progress`}>
          <span style={{ width: `${averageScore}%` }} />
        </div>
      </div>

      <div className="selected-track-meta">
        <p>
          <strong>{attemptsCount}</strong>
          Attempts completed
        </p>
        <p>
          <strong>{bestScore}%</strong>
          Best score
        </p>
        <p>
          <strong>{latestAttempt ? `${latestPercentage}%` : 'None'}</strong>
          Latest score
        </p>
      </div>

      <div className="selected-track-actions">
        <Link className="secondary-button" to={track.quizPath}>
          Start {track.label} Quiz
        </Link>
        <Link className="outline-button" to="/quizzes/attempts">
          View Results
        </Link>
      </div>
    </section>
  )
}
