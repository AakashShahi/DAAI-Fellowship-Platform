import { Navigate, Route } from 'react-router-dom'
import { ROLES } from '../constants/roles'
import HrLayout from '../layouts/HrLayout'
import ComingSoonPage from '../pages/ComingSoonPage'
import HrDashboard from '../pages/dashboards/HrDashboard'
import { protectRole } from './routeGuards'

export const hrRoutesElement = (
  <Route
    path="/hr"
    element={protectRole([ROLES.HR], <HrLayout />)}
  >
    <Route index element={<Navigate to="/hr/dashboard" replace />} />
    <Route path="dashboard" element={<HrDashboard />} />
    <Route
      path="staff"
      element={
        <ComingSoonPage
          title="Staff Onboarding"
          description="Manage new staff onboarding processes."
        />
      }
    />
    <Route
      path="attendance"
      element={
        <ComingSoonPage
          title="Attendance"
          description="View attendance rate and absence breakdown."
        />
      }
    />
    <Route
      path="fellows"
      element={
        <ComingSoonPage
          title="Fellow Management"
          description="Manage fellows and their lifecycle."
        />
      }
    />
    <Route
      path="instructors"
      element={
        <ComingSoonPage
          title="Instructor Assignment"
          description="Assign instructors to cohorts and sessions."
        />
      }
    />
    <Route
      path="activity-logs"
      element={
        <ComingSoonPage
          title="HR Activity Logs"
          description="View HR activity logs and history."
        />
      }
    />
  </Route>
)
