export default function ResourceLinks({ resources = [] }) {
  if (!resources.length) {
    return null
  }

  return (
    <div className="mt-5 rounded-lg border border-slate-200 bg-white p-5">
      <p className="text-xs font-black uppercase tracking-wide text-[#4f46e5]">
        Resources
      </p>
      <div className="mt-3 grid gap-2">
        {resources.map((resource) => (
          <a
            key={`${resource.title}-${resource.url}`}
            className="rounded-md bg-[#f8fafc] px-3 py-2 text-sm font-black text-[#4f46e5] transition hover:bg-[#eef2ff]"
            href={resource.url}
            target="_blank"
            rel="noreferrer"
          >
            {resource.title} · {resource.type}
          </a>
        ))}
      </div>
    </div>
  )
}
