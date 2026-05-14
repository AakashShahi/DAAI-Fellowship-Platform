import { Navigate, Route } from 'react-router-dom'
import { ROLES } from '../constants/roles'
import FellowLayout from '../layouts/FellowLayout'
import ComingSoonPage from '../pages/ComingSoonPage'
import FellowDashboard from '../pages/dashboards/FellowDashboard'
import FellowLearningPage from '../pages/fellow/FellowLearningPage'
import FellowLessonPage from '../pages/fellow/FellowLessonPage'
import FellowModulePage from '../pages/fellow/FellowModulePage'
import FellowMyTrackPage from '../pages/fellow/FellowMyTrackPage'
import LearningTrackDetailPage from '../pages/learningTracks/LearningTrackDetailPage'
import ProfileSettingsPage from '../pages/ProfileSettingsPage'
import QuizAttemptsPage from '../pages/quizzes/QuizAttemptsPage'
import QuizAttemptPage from '../pages/quizzes/QuizAttemptPage'
import QuizListPage from '../pages/quizzes/QuizListPage'
import QuizResultPage from '../pages/quizzes/QuizResultPage'
import { protectRole } from './routeGuards'

export const fellowRoutesElement = (
  <Route
    path="/fellow"
    element={protectRole([ROLES.FELLOW], <FellowLayout />)}
  >
    <Route index element={<Navigate to="/fellow/dashboard" replace />} />
    <Route path="dashboard" element={<FellowDashboard />} />
    <Route path="my-track" element={<FellowMyTrackPage />} />
    <Route path="learning" element={<FellowLearningPage />} />
    <Route path="modules/:moduleId" element={<FellowModulePage />} />
    <Route path="lessons/:lessonId" element={<FellowLessonPage />} />
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
    <Route
      path="assignments"
      element={
        <ComingSoonPage
          title="Assignments"
          description="Fellowship assignments and submissions will appear here once your cohort is enrolled."
        />
      }
    />
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
)
