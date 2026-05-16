import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Contact</h1>
      <p className="mt-3 text-slate-600">
        Questions about pathways, cohorts, or partnerships? Reach out to the CloudMandap
        fellowship team.
      </p>

      <Card className="mt-8">
        <p className="text-sm text-slate-600">
          Email:{' '}
          <a href="mailto:fellowship@cloudmandap.com" className="font-medium text-indigo-600">
            fellowship@cloudmandap.com
          </a>
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Website:{' '}
          <a
            href="https://www.cloudmandap.com/"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-indigo-600"
          >
            cloudmandap.com
          </a>
        </p>
      </Card>

      <Card className="mt-6">
        <h2 className="font-semibold text-slate-900">Send a message</h2>
        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            alert('Contact form is a placeholder — connect to your notification service later.')
          }}
        >
          <Input label="Name" name="name" required />
          <Input label="Email" type="email" name="email" required />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Message</span>
            <textarea
              name="message"
              rows={4}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Send
          </button>
        </form>
      </Card>
    </div>
  )
}
