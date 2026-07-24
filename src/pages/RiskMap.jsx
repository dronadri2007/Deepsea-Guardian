import Seo from '../components/Seo.jsx'
import { Container, SectionHeading, Badge } from '../components/ui.jsx'
import OceanMap from '../components/OceanMap.jsx'
import { zones, oceanHealthIndex, healthBand } from '../data/mockData.js'

export default function RiskMap() {
  return (
    <div className="py-14">
      <Seo
        title="Predictive Risk Map — DeepSea Guardian"
        description="AI-generated environmental risk heatmap across monitored deep-sea zones, with an Ocean Health Index for every zone."
      />
      <Container>
        <SectionHeading
          eyebrow="Predictive analytics"
          title="Predictive Risk Heatmap"
          subtitle="AI-generated risk forecasts across monitored zones. Warmer zones need faster intervention."
        />

        {/* Map */}
        <div className="overflow-hidden rounded-2xl border border-teal/15 shadow-sm">
          <OceanMap height={460} />
        </div>

        {/* Zone table */}
        <div className="mt-8 overflow-x-auto rounded-2xl border border-teal/15 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-teal/5 text-textd/80">
              <tr>
                <th className="px-4 py-3.5 font-semibold">Zone</th>
                <th className="px-4 py-3.5 font-semibold">Region</th>
                <th className="px-4 py-3.5 font-semibold">Risk</th>
                <th className="px-4 py-3.5 font-semibold">Ocean Health Index</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z, i) => {
                const score = oceanHealthIndex(z)
                const band  = healthBand(score)
                return (
                  <tr
                    key={z.id}
                    className={`border-t border-teal/10 transition-colors duration-100 hover:bg-teal/5 ${
                      i % 2 === 0 ? '' : 'bg-sky/40'
                    }`}
                  >
                    <td className="px-4 py-3.5 font-semibold text-ink">{z.id}</td>
                    <td className="px-4 py-3.5 text-textd/70">{z.region}</td>
                    <td className="px-4 py-3.5"><Badge tone={z.risk}>{z.risk}</Badge></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {/* Progress bar */}
                        <div className="h-2 w-28 overflow-hidden rounded-full bg-teal/10">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${score}%`, background: band.color }}
                          />
                        </div>
                        <span className="w-8 text-right tabular-nums font-semibold" style={{ color: band.color }}>
                          {score}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-medium" style={{ color: band.color }}>{band.label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-textd/55">
          <span className="font-semibold text-textd/70">Health score:</span>
          {[
            { label: 'Critical (0–39)', color: '#ff5a4d' },
            { label: 'Moderate (40–69)', color: '#ffb020' },
            { label: 'Good (70–100)',   color: '#2ec16e' },
          ].map(({ label, color }) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
      </Container>
    </div>
  )
}
