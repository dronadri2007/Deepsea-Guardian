import { Link } from 'react-router-dom'
import { Waves } from 'lucide-react'
import Seo from '../components/Seo.jsx'

export default function NotFound() {
  return (
    <div className="grid min-h-[75vh] place-items-center bg-ink px-4 text-center text-white">
      <Seo title="Lost at sea — DeepSea Guardian" description="Page not found." />
      <div className="flex flex-col items-center">
        {/* Animated wave icon */}
        <span className="animate-bounce">
          <Waves className="mx-auto h-16 w-16 text-teallite drop-shadow-[0_0_18px_rgba(79,208,203,0.4)]" aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-head text-5xl font-extrabold tracking-tight sm:text-7xl">
          Lost at sea.
        </h1>
        <p className="mt-4 max-w-sm leading-relaxed text-textmut">
          This page drifted off the map. Let's get you back to safe waters.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-teal px-7 py-3.5 font-semibold text-white shadow-lg shadow-teal/30 btn-transition"
        >
          Back to safe waters
        </Link>
      </div>
    </div>
  )
}
