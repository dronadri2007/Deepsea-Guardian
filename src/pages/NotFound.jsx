import { Link } from 'react-router-dom'
import { Waves } from 'lucide-react'
import Seo from '../components/Seo.jsx'

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center bg-ink px-4 text-center text-white">
      <Seo title="Lost at sea — DeepSea Guardian" description="Page not found." />
      <div>
        <Waves className="mx-auto h-14 w-14 text-teallite" aria-hidden="true" />
        <h1 className="mt-4 font-head text-5xl font-extrabold">Lost at sea.</h1>
        <p className="mt-3 text-textmut">This page drifted off the map.</p>
        <Link to="/" className="mt-6 inline-block rounded-xl bg-teal px-6 py-3 font-semibold text-white hover:scale-[1.03]">
          Back to safe waters
        </Link>
      </div>
    </div>
  )
}
