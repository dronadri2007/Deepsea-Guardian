import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Menu, X, Waves } from 'lucide-react'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/risk-map', label: 'Risk Map' },
  { to: '/biodiversity', label: 'Biodiversity' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/simulator', label: 'Simulator' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    `relative rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
      isActive
        ? 'text-tealink bg-teal/10 after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-teal'
        : 'text-textd/70 hover:text-tealink hover:bg-teal/5'
    }`

  return (
    <header className="sticky top-0 z-40 border-b border-teal/10 bg-sky/95 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6" aria-label="Main">
        <Link
          to="/"
          className="flex items-center gap-2.5 transition-opacity duration-150 hover:opacity-85"
          onClick={() => setOpen(false)}
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink shadow-sm">
            <Waves className="h-5 w-5 text-teallite" aria-hidden="true" />
          </span>
          <span className="font-head text-lg font-bold text-ink">
            DeepSea <span className="text-tealink">Guardian</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
          <Link
            to="/dashboard"
            className="ml-3 inline-flex items-center gap-1.5 rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white shadow-sm btn-transition"
          >
            Live Dashboard
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="rounded-lg p-2 text-ink transition-colors duration-150 hover:bg-teal/10 md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`overflow-hidden border-t border-teal/10 bg-sky transition-all duration-200 ease-in-out md:hidden ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col gap-1 px-4 py-3 sm:px-6">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
          <Link
            to="/dashboard"
            className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white shadow-sm btn-transition"
            onClick={() => setOpen(false)}
          >
            Live Dashboard
          </Link>
        </div>
      </div>
    </header>
  )
}
