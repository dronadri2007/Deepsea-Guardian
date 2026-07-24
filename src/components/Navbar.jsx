import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Menu, X, Waves, Volume2, VolumeX } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

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
  const { soundEnabled, setSoundEnabled, activeAlertsCount, triggerSound } = useApp()

  const linkClass = ({ isActive }) =>
    `relative rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
      isActive
        ? 'text-tealink bg-teal/10 after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-teal'
        : 'text-textd/70 hover:text-tealink hover:bg-teal/5'
    }`

  const handleSoundToggle = () => {
    const nextVal = !soundEnabled
    setSoundEnabled(nextVal)
    if (nextVal) {
      // Direct Web Audio API startup trigger (ensures browser gesture permission)
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
        const now = audioCtx.currentTime
        const osc = audioCtx.createOscillator()
        const g = audioCtx.createGain()
        osc.connect(g)
        g.connect(audioCtx.destination)
        g.gain.setValueAtTime(0.06, now)
        osc.frequency.setValueAtTime(800, now)
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
        osc.start(now)
        osc.stop(now + 0.2)
      } catch (e) {}
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-teal/10 bg-sky/95 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6" aria-label="Main">
        <Link
          to="/"
          className="flex items-center gap-2.5 transition-opacity duration-150 hover:opacity-85"
          onClick={() => {
            setOpen(false)
            triggerSound('click')
          }}
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
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={linkClass}
              onClick={() => triggerSound('click')}
            >
              {l.label}
              {l.label === 'Alerts' && activeAlertsCount > 0 && (
                <span className="absolute -top-0.5 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alert opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-alert"></span>
                </span>
              )}
            </NavLink>
          ))}

          {/* Audio toggle */}
          <button
            type="button"
            onClick={handleSoundToggle}
            className="ml-2 rounded-lg p-2 text-textd/70 hover:bg-teal/10 hover:text-tealink transition-colors"
            title={soundEnabled ? 'Mute Sonar Sounds' : 'Unmute Sonar Sounds'}
          >
            {soundEnabled ? (
              <Volume2 className="h-5 w-5 text-teal animate-pulse" />
            ) : (
              <VolumeX className="h-5 w-5 text-textd/40" />
            )}
          </button>

          <Link
            to="/dashboard"
            onClick={() => triggerSound('click')}
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
          onClick={() => {
            setOpen((v) => !v)
            triggerSound('click')
          }}
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
              onClick={() => {
                setOpen(false)
                triggerSound('click')
              }}
            >
              {l.label}
              {l.label === 'Alerts' && activeAlertsCount > 0 && (
                <span className="absolute -top-0.5 -right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alert opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-alert"></span>
                </span>
              )}
            </NavLink>
          ))}

          <div className="flex items-center justify-between border-t border-teal/5 mt-2 pt-2">
            <span className="text-xs text-textd/60 font-medium">Sonar Audio</span>
            <button
              type="button"
              onClick={handleSoundToggle}
              className="rounded-lg p-2 text-textd/70 hover:bg-teal/10 transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className="h-5 w-5 text-teal" />
              ) : (
                <VolumeX className="h-5 w-5 text-textd/40" />
              )}
            </button>
          </div>

          <Link
            to="/dashboard"
            className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white shadow-sm btn-transition"
            onClick={() => {
              setOpen(false)
              triggerSound('click')
            }}
          >
            Live Dashboard
          </Link>
        </div>
      </div>
    </header>
  )
}

