import { Link } from 'react-router-dom'
import { Archive, Settings } from 'lucide-react'
import CohortStatusBadge from './CohortStatusBadge'
import TrackBadge from './TrackBadge'
import Button from '../ui/Button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/Table'

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Not set'

export default function CohortTable({ cohorts, onArchive, isBusy }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead>Cohort name</TableHead>
            <TableHead>Track</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start date</TableHead>
            <TableHead>End date</TableHead>
            <TableHead>Fellows</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cohorts.map((cohort) => (
            <TableRow key={cohort.id}>
              <TableCell className="font-semibold text-slate-950">
                {cohort.name}
              </TableCell>
              <TableCell>
                <TrackBadge selectedTrack={cohort.track} />
              </TableCell>
              <TableCell>
                <CohortStatusBadge status={cohort.status} />
              </TableCell>
              <TableCell>{formatDate(cohort.startDate)}</TableCell>
              <TableCell>{formatDate(cohort.endDate)}</TableCell>
              <TableCell className="font-semibold text-slate-950">
                {cohort.fellowsCount ?? cohort.fellows?.length ?? 0}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="secondary">
                    <Link to={`/admin/cohorts/${cohort.id}`}>
                      <Settings className="h-3.5 w-3.5" />
                      Manage
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    disabled={isBusy || cohort.status === 'archived'}
                    onClick={() => onArchive(cohort)}
                  >
                    <Archive className="h-3.5 w-3.5" />
                    Archive
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
