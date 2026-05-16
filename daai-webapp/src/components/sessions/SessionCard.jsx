import { Link } from 'react-router-dom'
import SessionStatusBadge from './SessionStatusBadge'

export default function SessionCard({ session, to }) {
  return (
    <article className="rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-[#24140e]">{session.title}</h2>
          <p className="mt-1 text-sm font-bold text-[#6f5f57]">{new Date(session.sessionDate).toLocaleDateString()} · {session.startTime} - {session.endTime}</p>
          {session.cohortName ? <p className="mt-1 text-sm text-[#6f5f57]">{session.cohortName}</p> : null}
        </div>
        <SessionStatusBadge status={session.status} />
      </div>
      {session.description ? <p className="mt-3 text-sm text-[#6f5f57]">{session.description}</p> : null}
      <div className="mt-4 flex flex-wrap gap-3">
        {session.meetingLink && session.status === 'scheduled' ? <a className="text-sm font-black text-[#f26322]" href={session.meetingLink} target="_blank" rel="noreferrer">Join session</a> : null}
        {session.recordingLink ? <a className="text-sm font-black text-[#f26322]" href={session.recordingLink} target="_blank" rel="noreferrer">Recording</a> : null}
        {to ? <Link className="text-sm font-black text-[#f26322]" to={to}>Details</Link> : null}
      </div>
    </article>
  )
}
