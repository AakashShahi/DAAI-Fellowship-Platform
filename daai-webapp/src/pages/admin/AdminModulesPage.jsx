import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ModuleTable from '../../components/admin/ModuleTable'
import { MODULE_STATUS_OPTIONS } from '../../constants/curriculum'
import { FELLOW_TRACK_OPTIONS } from '../../constants/fellowTracks'
import { deleteModule, getModulesAdmin } from '../../services/learningService'

const getErrorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail
  return typeof detail === 'string' ? detail : fallback
}

export default function AdminModulesPage() {
  const [modules, setModules] = useState([])
  const [trackFilter, setTrackFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    getModulesAdmin(trackFilter, statusFilter)
      .then((data) => {
        if (isMounted) {
          setModules(data)
        }
      })
      .catch((loadError) => {
        if (isMounted) {
          setError(getErrorMessage(loadError, 'Unable to load modules.'))
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [trackFilter, statusFilter])

  const handleArchive = async (module) => {
    if (!window.confirm(`Archive ${module.title}?`)) {
      return
    }
    setIsBusy(true)
    setError('')
    try {
      await deleteModule(module.id)
      setModules((current) =>
        current.map((item) =>
          item.id === module.id ? { ...item, status: 'archived' } : item,
        ),
      )
    } catch (archiveError) {
      setError(getErrorMessage(archiveError, 'Unable to archive module.'))
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <section>
      <div className="mb-6 rounded-lg border border-orange-100 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
        <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
          Curriculum
        </p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#24140e]">Modules</h1>
            <p className="mt-3 max-w-2xl text-sm font-medium text-[#6f5f57]">
              Create track-based learning modules and publish lessons for fellows.
            </p>
          </div>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#f26322] px-4 text-sm font-black text-white transition hover:bg-[#d94f13]"
            to="/admin/modules/new"
          >
            Create Module
          </Link>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-black text-[#24140e] sm:max-w-xs">
            Track
            <select
              className="rounded-md border border-orange-100 bg-white px-3 py-2 text-sm font-bold text-[#6f5f57]"
              value={trackFilter}
              onChange={(event) => {
                setIsLoading(true)
                setTrackFilter(event.target.value)
              }}
            >
              <option value="">All tracks</option>
              {FELLOW_TRACK_OPTIONS.map((track) => (
                <option key={track.value} value={track.value}>
                  {track.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-black text-[#24140e] sm:max-w-xs">
            Status
            <select
              className="rounded-md border border-orange-100 bg-white px-3 py-2 text-sm font-bold text-[#6f5f57]"
              value={statusFilter}
              onChange={(event) => {
                setIsLoading(true)
                setStatusFilter(event.target.value)
              }}
            >
              <option value="">All statuses</option>
              {MODULE_STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {error ? (
        <p className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="rounded-lg border border-orange-100 bg-white p-5 text-sm font-bold text-[#6f5f57]">
          Loading modules...
        </p>
      ) : (
        <ModuleTable
          modules={modules}
          onArchive={handleArchive}
          isBusy={isBusy}
        />
      )}
    </section>
  )
}
