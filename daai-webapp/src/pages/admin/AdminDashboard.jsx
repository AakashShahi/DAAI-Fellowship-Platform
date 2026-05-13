const summaryCards = [
  { label: 'Total Applications', value: '248' },
  { label: 'Accepted Fellows', value: '86' },
  { label: 'Active Cohorts', value: '6' },
  { label: 'Trainers', value: '18' },
  { label: 'Employers', value: '32' },
  { label: 'Pending Reviews', value: '41' },
]

export default function AdminDashboard() {
  return (
    <section>
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
          Admin Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#24140e] lg:text-4xl">
          Platform Overview
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-[#6f5f57]">
          Monitor applications, fellows, cohorts, trainers, employers, and
          pending admin work.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <article
            key={card.label}
            className="rounded-lg border border-orange-100 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]"
          >
            <p className="text-sm font-bold text-[#6f5f57]">{card.label}</p>
            <p className="mt-3 text-4xl font-black text-[#24140e]">
              {card.value}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
