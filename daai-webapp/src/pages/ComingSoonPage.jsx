export default function ComingSoonPage({ title, description }) {
  return (
    <section>
      <div className="rounded-lg border border-orange-100 bg-white p-8 shadow-[0_18px_45px_-28px_rgba(112,55,23,0.35)]">
        <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
          Coming soon
        </p>
        <h1 className="mt-2 text-2xl font-black text-[#24140e] lg:text-3xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm font-medium text-[#6f5f57]">
          {description}
        </p>
      </div>
    </section>
  )
}
