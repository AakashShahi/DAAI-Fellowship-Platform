import { useState } from 'react'

export default function SubmissionForm({ initialSubmission, onSubmit, isSaving }) {
  const [submissionText, setSubmissionText] = useState(initialSubmission?.submissionText ?? '')
  const [links, setLinks] = useState(initialSubmission?.submissionLinks ?? [])
  const [draft, setDraft] = useState({ title: '', url: '', type: 'github' })

  const addLink = () => {
    if (!draft.title || !draft.url) return
    setLinks((current) => [...current, draft])
    setDraft({ title: '', url: '', type: 'github' })
  }

  return (
    <form className="grid gap-4 rounded-lg border border-orange-100 bg-white p-5 shadow-sm" onSubmit={(event) => { event.preventDefault(); onSubmit({ submissionText, submissionLinks: links }) }}>
      <h2 className="text-lg font-black text-[#24140e]">Your submission</h2>
      <label className="grid gap-2 text-sm font-black text-[#24140e]">
        Text answer
        <textarea className="min-h-36 rounded-md border border-orange-100 px-3 py-2 text-sm font-bold text-[#6f5f57]" value={submissionText} onChange={(event) => setSubmissionText(event.target.value)} />
      </label>
      <div className="rounded-lg border border-orange-100 bg-[#fff8f3] p-4">
        <p className="text-sm font-black text-[#24140e]">Links</p>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_140px_auto]">
          <input className="rounded-md border border-orange-100 px-3 py-2 text-sm" placeholder="Title" value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />
          <input className="rounded-md border border-orange-100 px-3 py-2 text-sm" placeholder="https://..." value={draft.url} onChange={(event) => setDraft((current) => ({ ...current, url: event.target.value }))} />
          <input className="rounded-md border border-orange-100 px-3 py-2 text-sm" placeholder="type" value={draft.type} onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))} />
          <button className="rounded-md border border-orange-100 px-3 py-2 text-sm font-black text-[#f26322]" type="button" onClick={addLink}>Add</button>
        </div>
        <div className="mt-3 grid gap-2">
          {links.map((link, index) => (
            <div key={`${link.title}-${link.url}`} className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm font-bold">
              <span>{link.title} · {link.type}</span>
              <button type="button" className="text-red-700" onClick={() => setLinks((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
            </div>
          ))}
        </div>
      </div>
      <button className="min-h-11 rounded-md bg-[#f26322] px-5 text-sm font-black text-white disabled:opacity-60" disabled={isSaving} type="submit">{isSaving ? 'Submitting...' : 'Submit Assignment'}</button>
    </form>
  )
}
