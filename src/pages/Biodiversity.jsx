import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Fish, ShieldAlert } from 'lucide-react'
import Seo from '../components/Seo.jsx'
import { Container, SectionHeading, Badge } from '../components/ui.jsx'
import { species } from '../data/mockData.js'

const statusTone = {
  'Vulnerable': 'warning',
  'Endangered': 'high',
  'Critically Endangered': 'critical',
}
const statusColor = {
  'Vulnerable': '#ffb020',
  'Endangered': '#ff7a45',
  'Critically Endangered': '#ff5a4d',
}
const trendIcon = { up: TrendingUp, down: TrendingDown, flat: Minus }
const trendColor = { up: '#2ec16e', down: '#ff5a4d', flat: '#9fb6cc' }
const trendLabel = { up: 'Increasing', down: 'Declining', flat: 'Stable' }

const filters = ['All', 'Critically Endangered', 'Endangered', 'Vulnerable']
const maxSightings = Math.max(...species.map((s) => s.sightings))

export default function Biodiversity() {
  const [filter, setFilter] = useState('All')
  const list = filter === 'All' ? species : species.filter((s) => s.status === filter)

  const stats = [
    { value: species.length, label: 'Species tracked', color: '#0b6d69' },
    { value: species.filter((s) => s.status === 'Critically Endangered').length, label: 'Critically endangered', color: '#ff5a4d' },
    { value: species.filter((s) => s.status === 'Endangered').length, label: 'Endangered', color: '#ff7a45' },
    { value: species.reduce((n, s) => n + s.sightings, 0), label: 'Total sightings', color: '#0b6d69' },
  ]

  return (
    <div className="py-14">
      <Seo
        title="Biodiversity Tracker — DeepSea Guardian"
        description="Monitoring endangered and vulnerable marine species across the deep sea, with sighting trends over time."
      />
      <Container>
        <SectionHeading
          eyebrow="Marine life"
          title="Biodiversity Tracker"
          subtitle="Monitoring endangered and vulnerable marine species across the deep sea, with sighting trends over time."
        />

        {/* Summary stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-teal/15 bg-white p-5 shadow-sm">
              <div className="font-head text-3xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
              <div className="mt-1 text-sm text-textd/70">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by conservation status">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 ${
                filter === f ? 'bg-teal text-white shadow-sm shadow-teal/30' : 'bg-teal/10 text-tealink hover:bg-teal/20'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => {
            const T = trendIcon[s.trend] || Minus
            const accent = statusColor[s.status] || '#0b6d69'
            return (
              <div
                key={s.name}
                className="card-hover group overflow-hidden rounded-2xl border border-teal/15 bg-white shadow-sm"
              >
                <div className="h-1.5 w-full" style={{ background: accent }} />
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-teal/10 transition-colors duration-200 group-hover:bg-teal/15">
                      <Fish className="h-6 w-6 text-tealink" aria-hidden="true" />
                    </span>
                    <Badge tone={statusTone[s.status] || 'info'}>{s.status}</Badge>
                  </div>

                  <h3 className="mt-4 font-head text-lg font-semibold leading-snug text-ink">{s.name}</h3>

                  {/* Sightings bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-textd/60">
                      <span>Sightings</span>
                      <span className="font-semibold text-tealink">{s.sightings}</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-teal/10">
                      <div className="h-full rounded-full" style={{ width: `${(s.sightings / maxSightings) * 100}%`, background: accent }} />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-textd/65">Zone {s.zone}</span>
                    <span
                      className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{ color: trendColor[s.trend], background: `${trendColor[s.trend]}18` }}
                    >
                      <T className="h-3.5 w-3.5" aria-hidden="true" />
                      {trendLabel[s.trend] || s.trend}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Conservation note */}
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-warn/30 bg-warn/5 p-5">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-warn" aria-hidden="true" />
          <p className="text-sm text-textd/80">
            {species.filter((s) => s.status === 'Critically Endangered').length} critically endangered species are being
            actively tracked. Declining sighting trends trigger automatic alerts to conservation partners for rapid response.
          </p>
        </div>
      </Container>
    </div>
  )
}
