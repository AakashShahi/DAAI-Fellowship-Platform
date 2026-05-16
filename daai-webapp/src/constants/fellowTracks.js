export const FELLOW_TRACK_VALUES = {
  QA: 'qa',
  AWS_PRACTITIONER: 'aws-practitioner',
  AWS_ARCHITECT: 'aws-architect',
  SALESFORCE: 'salesforce',
}

export const LEGACY_LEARNING_TRACK_BY_SELECTED_TRACK = {
  [FELLOW_TRACK_VALUES.QA]: 'QA',
  [FELLOW_TRACK_VALUES.AWS_PRACTITIONER]: 'AWS_PRACTITIONER',
  [FELLOW_TRACK_VALUES.AWS_ARCHITECT]: 'AWS_ARCHITECT',
  [FELLOW_TRACK_VALUES.SALESFORCE]: 'SALESFORCE',
}

export const SELECTED_TRACK_BY_LEGACY_LEARNING_TRACK = Object.entries(
  LEGACY_LEARNING_TRACK_BY_SELECTED_TRACK,
).reduce(
  (selectedTracks, [selectedTrack, learningTrack]) => ({
    ...selectedTracks,
    [learningTrack]: selectedTrack,
  }),
  {},
)
