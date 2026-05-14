import { ROLES } from '../constants/roles'
import { LEARNING_TRACKS, LEARNING_TRACK_OPTIONS } from '../constants/learningTracks'

const QUIZ_SLUG_ALIASES = {
  'aws-solutions-architect': 'aws-architect',
}

export const normalizeQuizSlug = (slug = '') =>
  QUIZ_SLUG_ALIASES[slug] ?? slug

export const getFellowTrack = (user) => {
  if (user?.role !== ROLES.FELLOW || !user?.learningTrack) {
    return null
  }

  return LEARNING_TRACKS[user.learningTrack] ?? null
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
