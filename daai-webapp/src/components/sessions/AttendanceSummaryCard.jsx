export default function AttendanceSummaryCard({ summary }) {
  const data = summary ?? { totalSessions: 0, present: 0, absent: 0, late: 0, excused: 0, attendancePercentage: 0 }
  return (
    <div className="rounded-lg border border-orange-100 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
      <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">Attendance</p>
      <h2 className="mt-2 text-3xl font-black text-[#24140e]">{data.attendancePercentage}%</h2>
      <div className="mt-4 grid gap-2 text-sm font-bold text-[#6f5f57] sm:grid-cols-5">
        <span>Total {data.totalSessions}</span>
        <span>Present {data.present}</span>
        <span>Absent {data.absent}</span>
        <span>Late {data.late}</span>
        <span>Excused {data.excused}</span>
      </div>
    </div>
  )
}
