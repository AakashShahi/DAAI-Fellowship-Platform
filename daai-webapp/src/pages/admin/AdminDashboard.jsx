import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import StatCard from '../../components/admin/StatCard'
import {
  FELLOW_TRACK_OPTIONS,
  getFellowTrackLabel,
} from '../../constants/fellowTracks'
import { getAdminTrackStats } from '../../services/adminFellowService'

const emptyStats = {
  totalFellows: 0,
  unassigned: 0,
  tracks: {},
}

export default function AdminDashboard() {
  const [trackStats, setTrackStats] = useState(emptyStats)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadStats = async () => {
      try {
        const data = await getAdminTrackStats()

        if (isMounted) {
          setTrackStats(data)
        }
      } catch {
        if (isMounted) {
          setError('Unable to load track statistics.')
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
        label: 'Total Fellows',
        value: trackStats.totalFellows,
        helper: 'All registered fellow accounts',
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
    [trackStats],
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
              Monitor fellow enrollment across QA, AWS, and Salesforce tracks.
            </p>
          </div>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#f26322] px-4 text-sm font-black text-white transition hover:bg-[#d94f13]"
            to="/admin/fellows"
          >
            Manage Fellows
          </Link>
        </div>
      </div>

      {error ? (
        <p className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="rounded-lg border border-orange-100 bg-white p-5 text-sm font-bold text-[#6f5f57]">
          Loading track statistics...
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
