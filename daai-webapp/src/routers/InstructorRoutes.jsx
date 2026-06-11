import { Navigate, Route } from 'react-router-dom'
import { ROLES } from '../constants/roles'
import InstructorLayout from '../layouts/InstructorLayout'
import ComingSoonPage from '../pages/ComingSoonPage'
import InstructorDashboard from '../pages/dashboards/InstructorDashboard'
import { protectRole } from './routeGuards'

export const instructorRoutesElement = (
  <Route
    path="/instructor"
    element={protectRole([ROLES.INSTRUCTOR], <InstructorLayout />)}
  >
    <Route index element={<Navigate to="/instructor/dashboard" replace />} />
    <Route path="dashboard" element={<InstructorDashboard />} />
    <Route
      path="cohorts"
      element={
        <ComingSoonPage
          title="My Cohorts"
          description="View and manage your assigned cohorts."
        />
      }
    />
    <Route
      path="sessions"
      element={
        <ComingSoonPage
          title="Sessions"
          description="View your upcoming and past sessions."
        />
      }
    />
    <Route
      path="assignments"
      element={
        <ComingSoonPage
          title="Assignments"
          description="Manage and review assignments."
        />
      }
    />
    <Route
      path="attendance"
      element={
        <ComingSoonPage
          title="Attendance"
          description="Mark and view attendance for your sessions."
        />
      }
    />
    <Route
      path="grades"
      element={
        <ComingSoonPage
          title="Grades"
          description="Review and publish grades for your cohorts."
        />
      }
    />
  </Route>
)
