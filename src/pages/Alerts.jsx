import { useState } from 'react'
import { Download } from 'lucide-react'
import Seo from '../components/Seo.jsx'
import { Container, SectionHeading, Badge } from '../components/ui.jsx'
import { alerts } from '../data/mockData.js'

const severities = ['All', 'Critical', 'High', 'Medium', 'Low']

export default function Alerts() {
  const [filter, setFilter] = useState('All')
  const rows = filter === 'All' ? alerts : alerts.filter((a) => a.severity === filter)

  return (
    <div className="py-12">
      <Seo title="Alerts & Reports — DeepSea Guardian" description="Actionable, filterable alerts for authorities, researchers and conservation partners." />
      <Container>
        <SectionHeading
          eyebrow="Response"
          title="Alerts & Reports"
          subtitle="Actionable alerts for authorities, researchers and conservation partners. Filter, review, and export."
        />

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {severities.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  filter === s ? 'bg-teal text-white' : 'bg-teal/10 text-tealink hover:bg-teal/20'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-teal/30 px-4 py-2 text-sm font-semibold text-tealink hover:bg-teal/5">
            <Download className="h-4 w-4" /> Export
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-teal/15 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-teal/5 text-textd">
              <tr>
                <th className="px-4 py-3 font-semibold">Alert ID</th>
                <th className="px-4 py-3 font-semibold">Zone</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Severity</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Raised</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-t border-teal/10">
                  <td className="px-4 py-3 font-semibold text-ink">{a.id}</td>
                  <td className="px-4 py-3 text-textd/70">{a.zone}</td>
                  <td className="px-4 py-3 text-textd/80">{a.type}</td>
                  <td className="px-4 py-3"><Badge tone={a.severity}>{a.severity}</Badge></td>
                  <td className="px-4 py-3 text-textd/70">{a.status}</td>
                  <td className="px-4 py-3 text-textd/60">{a.raised}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </div>
  )
}
