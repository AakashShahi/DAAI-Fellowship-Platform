import { Navigate, Route } from 'react-router-dom'
import { ROLES } from '../constants/roles'
import MentorLayout from '../layouts/MentorLayout'
import ComingSoonPage from '../pages/ComingSoonPage'
import MentorDashboard from '../pages/dashboards/MentorDashboard'
import { protectRole } from './routeGuards'

export const mentorRoutesElement = (
  <Route
    path="/mentor"
    element={protectRole([ROLES.MENTOR], <MentorLayout />)}
  >
    <Route index element={<Navigate to="/mentor/dashboard" replace />} />
    <Route path="dashboard" element={<MentorDashboard />} />
    <Route
      path="fellows"
      element={
        <ComingSoonPage
          title="Assigned fellows"
          description="A roster of fellows you support, progress snapshots, and notes will live here."
        />
      }
    />
    <Route
      path="sessions"
      element={
        <ComingSoonPage
          title="Mentoring sessions"
          description="Schedule 1:1s, office hours, and session history will connect here."
        />
      }
    />
    <Route
      path="resources"
      element={
        <ComingSoonPage
          title="Mentor resources"
          description="Shared guides, rubrics, and templates for mentoring will be available here."
        />
      }
    />
  </Route>
)
