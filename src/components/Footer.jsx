import { Link } from 'react-router-dom'
import { Waves } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-16 bg-ink text-textmut">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2 md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-panel">
              <Waves className="h-5 w-5 text-teallite" aria-hidden="true" />
            </span>
            <span className="font-head text-lg font-bold text-white">
              DeepSea <span className="text-teallite">Guardian</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm">
            AI-powered deep-ocean pollution &amp; biodiversity monitoring — detect, track and predict
            environmental risk before the damage is done.
          </p>
        </div>

        <div>
          <h2 className="font-head text-sm font-semibold text-white">Platform</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/dashboard" className="hover:text-teallite">Dashboard</Link></li>
            <li><Link to="/risk-map" className="hover:text-teallite">Risk Map</Link></li>
            <li><Link to="/biodiversity" className="hover:text-teallite">Biodiversity</Link></li>
            <li><Link to="/alerts" className="hover:text-teallite">Alerts</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="font-head text-sm font-semibold text-white">Project</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-teallite">About</Link></li>
            <li><span>HackOcean 2026</span></li>
            <li><span>Team SRU · PS03</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-5 text-center text-xs text-textmut">
          © {new Date().getFullYear()} DeepSea Guardian · Built for HackOcean 2026. Demo data for illustration.
        </div>
      </div>
    </footer>
  )
}
