import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import StatCard from '../../components/admin/StatCard'
import {
  FELLOW_TRACK_OPTIONS,
  getFellowTrackLabel,
} from '../../constants/fellowTracks'
import { getAdminTrackStats } from '../../services/adminFellowService'
import { getAdminCohortStats } from '../../services/cohortService'
import { getCurriculumStats } from '../../services/learningService'
import { getAssignmentStatsAdmin } from '../../services/assignmentService'

const emptyStats = {
  totalFellows: 0,
  unassigned: 0,
  tracks: {},
}

const emptyCohortStats = {
  totalCohorts: 0,
  active: 0,
  upcoming: 0,
  completed: 0,
  archived: 0,
}

const emptyCurriculumStats = {
  totalModules: 0,
  publishedModules: 0,
  draftModules: 0,
  archivedModules: 0,
  totalLessons: 0,
}

const emptyAssignmentStats = {
  totalAssignments: 0,
  publishedAssignments: 0,
  pendingReviews: 0,
  reviewedSubmissions: 0,
  needsResubmission: 0,
}

export default function AdminDashboard() {
  const [trackStats, setTrackStats] = useState(emptyStats)
  const [cohortStats, setCohortStats] = useState(emptyCohortStats)
  const [curriculumStats, setCurriculumStats] = useState(emptyCurriculumStats)
  const [assignmentStats, setAssignmentStats] = useState(emptyAssignmentStats)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadStats = async () => {
      try {
        const [trackData, cohortData, curriculumData, assignmentData] = await Promise.all([
          getAdminTrackStats(),
          getAdminCohortStats(),
          getCurriculumStats(),
          getAssignmentStatsAdmin(),
        ])

        if (isMounted) {
          setTrackStats(trackData)
          setCohortStats(cohortData)
          setCurriculumStats(curriculumData)
          setAssignmentStats(assignmentData)
        }
      } catch {
        if (isMounted) {
          setError('Unable to load dashboard statistics.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadStats()

    return () => {
      isMounted = false
    }
  }, [])

  const statCards = useMemo(
    () => [
      {
        label: 'Total Cohorts',
        value: cohortStats.totalCohorts,
        helper: 'All program cohorts',
      },
      {
        label: 'Active Cohorts',
        value: cohortStats.active,
        helper: 'Currently running',
      },
      {
        label: 'Upcoming Cohorts',
        value: cohortStats.upcoming,
        helper: 'Scheduled to start',
      },
      {
        label: 'Completed Cohorts',
        value: cohortStats.completed,
        helper: 'Finished programs',
      },
      {
        label: 'Archived Cohorts',
        value: cohortStats.archived,
        helper: 'Hidden from active planning',
      },
      {
        label: 'Total Fellows',
        value: trackStats.totalFellows,
        helper: 'All registered fellow accounts',
      },
      {
        label: 'Total Assignments',
        value: assignmentStats.totalAssignments,
        helper: 'All coursework',
      },
      {
        label: 'Published Assignments',
        value: assignmentStats.publishedAssignments,
        helper: 'Visible to fellows',
      },
      {
        label: 'Pending Reviews',
        value: assignmentStats.pendingReviews,
        helper: 'Awaiting admin action',
      },
      {
        label: 'Reviewed Submissions',
        value: assignmentStats.reviewedSubmissions,
        helper: 'Completed reviews',
      },
      {
        label: 'Needs Resubmission',
        value: assignmentStats.needsResubmission,
        helper: 'Returned to fellows',
      },
      {
        label: 'Total Modules',
        value: curriculumStats.totalModules,
        helper: 'Curriculum modules',
      },
      {
        label: 'Published Modules',
        value: curriculumStats.publishedModules,
        helper: 'Visible to fellows',
      },
      {
        label: 'Draft Modules',
        value: curriculumStats.draftModules,
        helper: 'Not visible yet',
      },
      {
        label: 'Archived Modules',
        value: curriculumStats.archivedModules,
        helper: 'Retired curriculum',
      },
      {
        label: 'Total Lessons',
        value: curriculumStats.totalLessons,
        helper: 'Across all modules',
      },
      {
        label: 'Unassigned Fellows',
        value: trackStats.unassigned,
        helper: 'Need track selection',
      },
      ...FELLOW_TRACK_OPTIONS.map((track) => ({
        label: `${getFellowTrackLabel(track.value)} Fellows`,
        value: trackStats.tracks?.[track.value] ?? 0,
        helper: 'Selected learning track',
      })),
    ],
    [assignmentStats, cohortStats, curriculumStats, trackStats],
  )

  return (
    <section>
      <div className="mb-6 rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
        <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
          Admin Dashboard
        </p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#24140e] lg:text-4xl">
              Platform Overview
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-[#6f5f57]">
              Monitor cohorts and fellow enrollment across QA, AWS, and Salesforce tracks.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#f26322] px-4 text-sm font-black text-white transition hover:bg-[#d94f13]"
              to="/admin/assignments"
            >
              Manage Assignments
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-orange-100 bg-white px-4 text-sm font-black text-[#f26322] transition hover:bg-[#fff1e8]"
              to="/admin/modules"
            >
              Manage Curriculum
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-orange-100 bg-white px-4 text-sm font-black text-[#f26322] transition hover:bg-[#fff1e8]"
              to="/admin/cohorts"
            >
              Manage Cohorts
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-orange-100 bg-white px-4 text-sm font-black text-[#f26322] transition hover:bg-[#fff1e8]"
              to="/admin/fellows"
            >
              Manage Fellows
            </Link>
          </div>
        </div>
      </div>

      {error ? (
        <p className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="rounded-lg border border-orange-100 bg-white p-5 text-sm font-bold text-[#6f5f57]">
          Loading dashboard statistics...
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>
      )}
    </section>
  )
}
