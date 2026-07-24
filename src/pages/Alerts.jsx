import { useState } from 'react'
import { Download, AlertTriangle, Clock, CheckCircle2, Inbox, Sparkles } from 'lucide-react'
import Seo from '../components/Seo.jsx'
import { Container, SectionHeading, Badge } from '../components/ui.jsx'
import { useApp } from '../context/AppContext.jsx'

const severities = ['All', 'Critical', 'High', 'Medium', 'Low']
const statusColor = {
  Open: '#ff5a4d',
  Investigating: '#ffb020',
  Dispatched: '#0b6d69',
  Resolved: '#2e9e5b',
  Logged: '#9fb6cc',
}

function exportCsv(rows) {
  const header = ['Alert ID', 'Zone', 'Type', 'Severity', 'Status', 'Raised']
  const body = rows.map((a) => [a.id, a.zone, a.type, a.severity, a.status, a.raised])
  const csv = [header, ...body].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'deepsea-guardian-alerts.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export default function Alerts() {
  const { alerts, setActiveReport, triggerSound } = useApp()
  const [filter, setFilter] = useState('All')
  const rows = filter === 'All' ? alerts : alerts.filter((a) => a.severity === filter)

  const stats = [
    { icon: Inbox, value: alerts.filter((a) => a.status === 'Open').length, label: 'Open', color: '#ff5a4d' },
    { icon: Clock, value: alerts.filter((a) => ['Investigating', 'Dispatched'].includes(a.status)).length, label: 'In progress', color: '#ffb020' },
    { icon: CheckCircle2, value: alerts.filter((a) => a.status === 'Resolved').length, label: 'Resolved', color: '#2e9e5b' },
    { icon: AlertTriangle, value: alerts.filter((a) => a.severity === 'Critical').length, label: 'Critical', color: '#ff5a4d' },
  ]

  return (
    <div className="py-14">
      <Seo title="Alerts &amp; Reports — DeepSea Guardian" description="Actionable, filterable alerts for authorities, researchers and conservation partners." />
      <Container>
        <SectionHeading
          eyebrow="Response"
          title="Alerts &amp; Reports"
          subtitle="Actionable alerts for authorities, researchers and conservation partners. Filter, review, and export."
        />

        {/* Summary stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-teal/15 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-textd/70">{s.label}</span>
                <s.icon className="h-4 w-4" style={{ color: s.color }} aria-hidden="true" />
              </div>
              <div className="mt-2 font-head text-3xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by severity">
            {severities.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setFilter(s)
                  triggerSound('click')
                }}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 ${
                  filter === s ? 'bg-teal text-white shadow-sm shadow-teal/30' : 'bg-teal/10 text-tealink hover:bg-teal/20 hover:shadow-sm'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              exportCsv(rows)
              triggerSound('success')
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-teal/30 px-4 py-2 text-sm font-semibold text-tealink transition-colors duration-150 hover:border-teal/50 hover:bg-teal/5 active:scale-95 cursor-pointer"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-teal/15 bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-teal/5 text-textd/80">
              <tr>
                <th className="px-4 py-3.5 font-semibold">Alert ID</th>
                <th className="px-4 py-3.5 font-semibold">Zone</th>
                <th className="px-4 py-3.5 font-semibold">Type</th>
                <th className="px-4 py-3.5 font-semibold">Severity</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="px-4 py-3.5 font-semibold">Raised</th>
                <th className="px-4 py-3.5 font-semibold">Mitigation</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a, i) => (
                <tr key={a.id} className={`border-t border-teal/10 transition-colors duration-100 hover:bg-teal/5 ${i % 2 === 0 ? '' : 'bg-sky/40'}`}>
                  <td className="px-4 py-3.5 font-semibold text-ink">{a.id}</td>
                  <td className="px-4 py-3.5 text-textd/70">{a.zone}</td>
                  <td className="px-4 py-3.5 text-textd/80">{a.type}</td>
                  <td className="px-4 py-3.5"><Badge tone={a.severity}>{a.severity}</Badge></td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1.5 font-medium" style={{ color: statusColor[a.status] || '#0b2f4f' }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColor[a.status] || '#0b2f4f' }} />
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-textd/55 tabular-nums">{a.raised}</td>
                  <td className="px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveReport({
                          type: 'alert',
                          id: a.id,
                          name: a.type,
                          metrics: { id: a.id, zone: a.zone, type: a.type, severity: a.severity, status: a.status, raised: a.raised }
                        })
                        triggerSound('click')
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-teal/10 hover:bg-teal px-2.5 py-1 text-xs font-semibold text-tealink hover:text-white transition-all active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3" /> Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {rows.length === 0 && <p className="py-12 text-center text-sm text-textd/50">No alerts match this filter.</p>}
        </div>

        <p className="mt-3 text-right text-xs text-textd/40">Showing {rows.length} of {alerts.length} alerts</p>
      </Container>
    </div>
  )
}
