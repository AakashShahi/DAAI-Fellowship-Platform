import { Link } from 'react-router-dom'

export default function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="text-sm font-bold text-slate-900">DAAI Fellowship</p>
          <p className="mt-2 text-sm text-slate-600">
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
