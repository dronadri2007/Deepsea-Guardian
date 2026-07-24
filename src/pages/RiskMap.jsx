import Seo from '../components/Seo.jsx'
import { Container, SectionHeading, Badge } from '../components/ui.jsx'
import OceanMap from '../components/OceanMap.jsx'
import { zones, oceanHealthIndex, healthBand } from '../data/mockData.js'

export default function RiskMap() {
  return (
    <div className="py-12">
      <Seo title="Predictive Risk Map — DeepSea Guardian" description="AI-generated environmental risk heatmap across monitored deep-sea zones, with an Ocean Health Index for every zone." />
      <Container>
        <SectionHeading
          eyebrow="Predictive analytics"
          title="Predictive Risk Heatmap"
          subtitle="AI-generated risk forecasts across monitored zones. Warmer zones need faster intervention."
        />
        <OceanMap height={460} />

        <div className="mt-8 overflow-x-auto rounded-2xl border border-teal/15 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-teal/5 text-textd">
              <tr>
                <th className="px-4 py-3 font-semibold">Zone</th>
                <th className="px-4 py-3 font-semibold">Region</th>
                <th className="px-4 py-3 font-semibold">Risk</th>
                <th className="px-4 py-3 font-semibold">Ocean Health Index</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z) => {
                const score = oceanHealthIndex(z)
                const band = healthBand(score)
                return (
                  <tr key={z.id} className="border-t border-teal/10">
                    <td className="px-4 py-3 font-semibold text-ink">{z.id}</td>
                    <td className="px-4 py-3 text-textd/70">{z.region}</td>
                    <td className="px-4 py-3"><Badge tone={z.risk}>{z.risk}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-teal/10">
                          <div className="h-full rounded-full" style={{ width: `${score}%`, background: band.color }} />
                        </div>
                        <span className="font-semibold" style={{ color: band.color }}>{score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: band.color }}>{band.label}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Container>
    </div>
  )
}
