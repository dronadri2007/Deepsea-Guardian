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
    <div className="py-14">
      <Seo title="Alerts &amp; Reports — DeepSea Guardian" description="Actionable, filterable alerts for authorities, researchers and conservation partners." />
      <Container>
        <SectionHeading
          eyebrow="Response"
          title="Alerts &amp; Reports"
          subtitle="Actionable alerts for authorities, researchers and conservation partners. Filter, review, and export."
        />

        {/* Toolbar */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by severity">
            {severities.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 ${
                  filter === s
                    ? 'bg-teal text-white shadow-sm shadow-teal/30'
                    : 'bg-teal/10 text-tealink hover:bg-teal/20 hover:shadow-sm'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-teal/30 px-4 py-2 text-sm font-semibold text-tealink transition-colors duration-150 hover:bg-teal/8 hover:border-teal/50 active:scale-95"
          >
            <Download className="h-4 w-4" /> Export
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-teal/15 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-teal/5 text-textd/80">
              <tr>
                <th className="px-4 py-3.5 font-semibold">Alert ID</th>
                <th className="px-4 py-3.5 font-semibold">Zone</th>
                <th className="px-4 py-3.5 font-semibold">Type</th>
                <th className="px-4 py-3.5 font-semibold">Severity</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="px-4 py-3.5 font-semibold">Raised</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a, i) => (
                <tr
                  key={a.id}
                  className={`border-t border-teal/10 transition-colors duration-100 hover:bg-teal/5 ${
                    i % 2 === 0 ? '' : 'bg-sky/40'
                  }`}
                >
                  <td className="px-4 py-3.5 font-semibold text-ink">{a.id}</td>
                  <td className="px-4 py-3.5 text-textd/70">{a.zone}</td>
                  <td className="px-4 py-3.5 text-textd/80">{a.type}</td>
                  <td className="px-4 py-3.5"><Badge tone={a.severity}>{a.severity}</Badge></td>
                  <td className="px-4 py-3.5 text-textd/70">{a.status}</td>
                  <td className="px-4 py-3.5 text-textd/55 tabular-nums">{a.raised}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {rows.length === 0 && (
            <p className="py-12 text-center text-sm text-textd/50">No alerts match this filter.</p>
          )}
        </div>

        {/* Row count */}
        <p className="mt-3 text-right text-xs text-textd/40">
          Showing {rows.length} of {alerts.length} alerts
        </p>
      </Container>
    </div>
  )
}
