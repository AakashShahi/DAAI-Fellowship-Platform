import { Navigate, Route } from 'react-router-dom'
import { ROLES } from '../constants/roles'
import FellowLayout from '../layouts/FellowLayout'
import ComingSoonPage from '../pages/ComingSoonPage'
import FellowDashboard from '../pages/dashboards/FellowDashboard'
import FellowAssignmentDetailPage from '../pages/fellow/FellowAssignmentDetailPage'
import FellowAssignmentsPage from '../pages/fellow/FellowAssignmentsPage'
import FellowAssignmentSubmissionsPage from '../pages/fellow/FellowAssignmentSubmissionsPage'
import FellowLearningPage from '../pages/fellow/FellowLearningPage'
import FellowLessonPage from '../pages/fellow/FellowLessonPage'
import FellowModulePage from '../pages/fellow/FellowModulePage'
import FellowMyTrackPage from '../pages/fellow/FellowMyTrackPage'
import TrackSelectionPage from '../pages/fellow/TrackSelectionPage'
import LearningTrackDetailPage from '../pages/learningTracks/LearningTrackDetailPage'
import ProfileSettingsPage from '../pages/ProfileSettingsPage'
import QuizAttemptsPage from '../pages/quizzes/QuizAttemptsPage'
import QuizAttemptPage from '../pages/quizzes/QuizAttemptPage'
import QuizListPage from '../pages/quizzes/QuizListPage'
import QuizResultPage from '../pages/quizzes/QuizResultPage'
import FellowTrackGuard from '../routes/FellowTrackGuard'
import { protectRole } from './routeGuards'

export const fellowRoutesElement = (
  <Route
    path="/fellow"
    element={protectRole([ROLES.FELLOW], <FellowLayout />)}
  >
    <Route index element={<Navigate to="/fellow/dashboard" replace />} />
    <Route path="select-track" element={<TrackSelectionPage />} />
    <Route element={<FellowTrackGuard />}>
      <Route path="dashboard" element={<FellowDashboard />} />
      <Route path="my-track" element={<FellowMyTrackPage />} />
      <Route path="learning" element={<FellowLearningPage />} />
      <Route path="learning/:moduleId" element={<FellowModulePage />} />
      <Route path="learning/:moduleId/lessons/:lessonId" element={<FellowLessonPage />} />
      <Route path="modules/:moduleId" element={<FellowModulePage />} />
      <Route path="lessons/:lessonId" element={<Navigate to="/fellow/learning" replace />} />
      <Route path="quizzes" element={<QuizListPage />} />
      <Route path="quizzes/attempts" element={<QuizAttemptsPage />} />
      <Route path="quizzes/attempts/:attemptId" element={<QuizResultPage />} />
      <Route path="quizzes/:category" element={<QuizAttemptPage />} />
      <Route path="quizzes/:category/result" element={<QuizResultPage />} />
      <Route path="profile/settings" element={<ProfileSettingsPage />} />
      <Route
        path="learning-tracks/:trackSlug"
        element={<LearningTrackDetailPage />}
      />
      <Route path="courses/:trackSlug" element={<LearningTrackDetailPage />} />
      <Route path="assignments/submissions" element={<FellowAssignmentSubmissionsPage />} />
      <Route path="submissions" element={<FellowAssignmentSubmissionsPage />} />
      <Route path="assignments/:assignmentId" element={<FellowAssignmentDetailPage />} />
      <Route path="assignments" element={<FellowAssignmentsPage />} />
      <Route
        path="announcements"
        element={
          <ComingSoonPage
            title="Announcements"
            description="Program-wide announcements and reminders will be posted here."
          />
        }
      />
    </Route>
  </Route>
)
