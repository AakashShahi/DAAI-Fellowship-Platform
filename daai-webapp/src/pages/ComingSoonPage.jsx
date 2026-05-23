export default function ComingSoonPage({ title, description }) {
  return (
    <section>
      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)]">
        <p className="text-xs font-black uppercase tracking-wide text-[#4f46e5]">
          Coming soon
        </p>
        <h1 className="mt-2 text-2xl font-black text-[#0f172a] lg:text-3xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm font-medium text-[#475569]">
          {description}
        </p>
      </div>
    </section>
  )
}
