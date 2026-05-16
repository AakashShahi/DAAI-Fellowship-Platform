import { ROLES } from '../constants/roles'
import { LEARNING_TRACKS, LEARNING_TRACK_OPTIONS } from '../constants/learningTracks'
import {
  LEGACY_LEARNING_TRACK_BY_SELECTED_TRACK,
} from '../constants/fellowTracks'

const QUIZ_SLUG_ALIASES = {
  'aws-solutions-architect': 'aws-architect',
}

export const normalizeQuizSlug = (slug = '') =>
  QUIZ_SLUG_ALIASES[slug] ?? slug

export const getFellowTrack = (user) => {
  if (user?.role !== ROLES.FELLOW) {
    return null
  }

  const learningTrack =
    user?.learningTrack ??
    LEGACY_LEARNING_TRACK_BY_SELECTED_TRACK[user?.selectedTrack]

  return LEARNING_TRACKS[learningTrack] ?? null
}

export const getTrackByQuizSlug = (slug) => {
  const normalizedSlug = normalizeQuizSlug(slug)

  return LEARNING_TRACK_OPTIONS.find(
    (track) => normalizeQuizSlug(track.quizSlug) === normalizedSlug,
  )
}

export const canAccessQuiz = (user, quizSlug) => {
  if (user?.role !== ROLES.FELLOW) {
    return true
  }

  const selectedTrack = getFellowTrack(user)
  if (!selectedTrack) {
    return false
  }

  return normalizeQuizSlug(selectedTrack.quizSlug) === normalizeQuizSlug(quizSlug)
}

export const getQuizAccessMessage = (user, quizSlug) => {
  const selectedTrack = getFellowTrack(user)
  const requestedTrack = getTrackByQuizSlug(quizSlug)

  if (!selectedTrack) {
    return 'Select a learning track before opening quizzes.'
  }

  return `You are enrolled in ${selectedTrack.label} track. You cannot access ${
    requestedTrack?.label ?? 'this'
  } quiz.`
}
