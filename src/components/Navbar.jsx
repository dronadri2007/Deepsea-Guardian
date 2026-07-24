import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Menu, X, Waves } from 'lucide-react'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/risk-map', label: 'Risk Map' },
  { to: '/biodiversity', label: 'Biodiversity' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'text-tealink bg-teal/10' : 'text-textd/70 hover:text-tealink hover:bg-teal/5'
    }`

  return (
    <header className="sticky top-0 z-40 border-b border-teal/10 bg-sky/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3" aria-label="Main">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink">
            <Waves className="h-5 w-5 text-teallite" aria-hidden="true" />
          </span>
          <span className="font-head text-lg font-bold text-ink">
            DeepSea <span className="text-tealink">Guardian</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
          <Link
            to="/dashboard"
            className="ml-2 rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.03]"
          >
            Live Dashboard
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-ink md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-teal/10 bg-sky px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkClass} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
