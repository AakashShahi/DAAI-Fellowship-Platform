import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ROLES } from '../constants/roles'
import EmployerDashboard from '../pages/dashboards/EmployerDashboard'
import ProfileSettingsPage from '../pages/ProfileSettingsPage'
import InstructorDashboard from '../pages/dashboards/InstructorDashboard'
import DashboardRedirect from '../routes/DashboardRedirect'
import { adminRoutesElement } from './AdminRoutes'
import { fellowRoutesElement } from './FellowRoutes'
import LegacyPrefixRedirect from './LegacyPrefixRedirect'
import { hrRoutesElement } from './HrRoutes'
import { publicRouteElements } from './PublicRoutes'
import { protect, protectRole } from './routeGuards'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
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
        {hrRoutesElement}

        <Route
          path="/instructor/dashboard"
          element={protectRole([ROLES.INSTRUCTOR], <InstructorDashboard />)}
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
