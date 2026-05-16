export default function TrackSelectionCard({
  track,
  isSaving,
  onSelect,
}) {
  return (
    <article className="track-selection-card">
      <div>
        <strong className="track-selection-icon" aria-hidden="true">
          {track.iconText}
        </strong>
        <span>{track.pathLabel}</span>
        <h2>{track.label}</h2>
        <p>{track.description}</p>
      </div>

      <div className="track-skills">
        {track.skills.map((skill) => (
          <small key={skill}>{skill}</small>
        ))}
      </div>

      <div className="track-selection-actions">
        <button
          type="button"
          onClick={() => onSelect(track.selectedTrack)}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Select Track'}
        </button>
      </div>
    </article>
  )
}
