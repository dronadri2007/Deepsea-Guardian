import { TrendingUp, TrendingDown, Minus, Fish } from 'lucide-react'
import Seo from '../components/Seo.jsx'
import { Container, SectionHeading, Badge } from '../components/ui.jsx'
import { species } from '../data/mockData.js'

const statusTone = {
  'Vulnerable': 'warning',
  'Endangered': 'high',
  'Critically Endangered': 'critical',
}
const trendIcon = { up: TrendingUp, down: TrendingDown, flat: Minus }
const trendColor = { up: '#2ec16e', down: '#ff5a4d', flat: '#9fb6cc' }

export default function Biodiversity() {
  return (
    <div className="py-12">
      <Seo title="Biodiversity Tracker — DeepSea Guardian" description="Monitoring endangered and vulnerable marine species across the deep sea, with sighting trends over time." />
      <Container>
        <SectionHeading
          eyebrow="Marine life"
          title="Biodiversity Tracker"
          subtitle="Monitoring endangered and vulnerable marine species across the deep sea, with sighting trends over time."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {species.map((s) => {
            const T = trendIcon[s.trend] || Minus
            return (
              <div key={s.name} className="rounded-2xl border border-teal/15 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal/10">
                    <Fish className="h-6 w-6 text-tealink" aria-hidden="true" />
                  </span>
                  <Badge tone={statusTone[s.status] || 'info'}>{s.status}</Badge>
                </div>
                <h3 className="mt-4 font-head text-lg font-semibold text-ink">{s.name}</h3>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-textd/70">{s.sightings} sightings · Zone {s.zone}</span>
                  <span className="flex items-center gap-1 font-semibold" style={{ color: trendColor[s.trend] }}>
                    <T className="h-4 w-4" /> {s.trend}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </Container>
    </div>
  )
}
