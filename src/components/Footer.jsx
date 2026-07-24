import { Link } from 'react-router-dom'
import { Waves } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-16 bg-ink text-textmut">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 sm:grid-cols-2 md:grid-cols-4">
        {/* Brand column */}
        <div className="sm:col-span-2 md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-panel shadow-sm">
              <Waves className="h-5 w-5 text-teallite" aria-hidden="true" />
            </span>
            <span className="font-head text-lg font-bold text-white">
              DeepSea <span className="text-teallite">Guardian</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            AI-powered deep-ocean pollution &amp; biodiversity monitoring — detect, track and predict
            environmental risk before the damage is done.
          </p>
        </div>

        {/* Platform links */}
        <div>
          <h2 className="font-head text-sm font-semibold uppercase tracking-wide text-white/80">Platform</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              { to: '/dashboard', label: 'Dashboard' },
              { to: '/risk-map', label: 'Risk Map' },
              { to: '/biodiversity', label: 'Biodiversity' },
              { to: '/alerts', label: 'Alerts' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="transition-colors duration-150 hover:text-teallite"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Project links */}
        <div>
          <h2 className="font-head text-sm font-semibold uppercase tracking-wide text-white/80">Project</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link to="/about" className="transition-colors duration-150 hover:text-teallite">
                About
              </Link>
            </li>
            <li><span className="opacity-60">HackOcean 2026</span></li>
            <li><span className="opacity-60">Team SRU · PS03</span></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-5 text-center text-xs text-textmut/70 sm:px-6">
          © {new Date().getFullYear()} DeepSea Guardian · Built for HackOcean 2026.{' '}
          <span className="opacity-60">Demo data for illustration.</span>
        </div>
      </div>
    </footer>
  )
}
