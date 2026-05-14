import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ROLES } from '../constants/roles'
import EmployerDashboard from '../pages/dashboards/EmployerDashboard'
import ProfileSettingsPage from '../pages/ProfileSettingsPage'
import TrainerDashboard from '../pages/dashboards/TrainerDashboard'
import DashboardRedirect from '../routes/DashboardRedirect'
import { adminRoutesElement } from './AdminRoutes'
import { fellowRoutesElement } from './FellowRoutes'
import LegacyPrefixRedirect from './LegacyPrefixRedirect'
import { mentorRoutesElement } from './MentorRoutes'
import { publicRouteElements } from './PublicRoutes'
import { protect, protectRole } from './routeGuards'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        {publicRouteElements}

        <Route
          path="/quizzes/*"
          element={
            <LegacyPrefixRedirect
              from="/quizzes"
              to="/fellow/quizzes"
              fellowOnly
            />
          }
        />
        <Route
          path="/learning-tracks/*"
          element={
            <LegacyPrefixRedirect
              from="/learning-tracks"
              to="/fellow/learning-tracks"
              fellowOnly
            />
          }
        />
        <Route
          path="/courses/*"
          element={
            <LegacyPrefixRedirect
              from="/courses"
              to="/fellow/courses"
              fellowOnly
            />
          }
        />

        <Route path="/dashboard" element={protect(<DashboardRedirect />)} />
        <Route
          path="/profile/settings"
          element={protect(<ProfileSettingsPage />)}
        />

        {adminRoutesElement}
        {fellowRoutesElement}
        {mentorRoutesElement}

        <Route
          path="/trainer/dashboard"
          element={protectRole([ROLES.TRAINER], <TrainerDashboard />)}
        />
        <Route
          path="/employer/dashboard"
          element={protectRole([ROLES.EMPLOYER], <EmployerDashboard />)}
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
