import { Link } from 'react-router-dom'

export default function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-600 text-lg font-bold text-white">
              D
            </span>
            <span>
              <span className="block text-sm font-bold text-slate-900">DAAI Fellowship</span>
              <span className="block text-xs text-slate-500">by CloudMandap</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
            Data, Automation &amp; Artificial Intelligence Fellowship by{' '}
            <a
              href="https://www.cloudmandap.com/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-indigo-600 hover:text-indigo-700"
            >
              CloudMandap
            </a>
            .
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Program</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/fellowship" className="text-slate-600 hover:text-indigo-600">
                Overview
              </Link>
            </li>
            <li>
              <Link to="/fellowship#pathways" className="text-slate-600 hover:text-indigo-600">
                Tracks
              </Link>
            </li>
            <li>
              <Link to="/fellowship#how-it-works" className="text-slate-600 hover:text-indigo-600">
                How It Works
              </Link>
            </li>
            <li>
              <Link to="/fellowship/apply" className="text-slate-600 hover:text-indigo-600">
                Apply
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Company</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/about" className="text-slate-600 hover:text-indigo-600">
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-slate-600 hover:text-indigo-600">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Portal</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/login" className="text-slate-600 hover:text-indigo-600">
                Login
              </Link>
            </li>
            <li>
              <Link to="/register" className="text-slate-600 hover:text-indigo-600">
                Register
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} CloudMandap · DAAI Fellowship Platform
      </div>
    </footer>
  )
}
