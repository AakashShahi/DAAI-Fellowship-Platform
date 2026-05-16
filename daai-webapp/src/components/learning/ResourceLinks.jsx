export default function ResourceLinks({ resources = [] }) {
  if (!resources.length) {
    return null
  }

  return (
    <div className="mt-5 rounded-lg border border-orange-100 bg-white p-5">
      <p className="text-xs font-black uppercase tracking-wide text-[#f26322]">
        Resources
      </p>
      <div className="mt-3 grid gap-2">
        {resources.map((resource) => (
          <a
            key={`${resource.title}-${resource.url}`}
            className="rounded-md bg-[#fff8f3] px-3 py-2 text-sm font-black text-[#f26322] transition hover:bg-[#fff1e8]"
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
