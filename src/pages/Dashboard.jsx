import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { AlertTriangle, Trash2, Waypoints, ThermometerSun, Radio, Satellite } from 'lucide-react'
import Seo from '../components/Seo.jsx'
import OceanMap from '../components/OceanMap.jsx'
import OceanHealthGauge from '../components/OceanHealthGauge.jsx'
import { kpis, detections, riskTrend, fleetHealthIndex, fleet } from '../data/mockData.js'

const sevBorder = { critical: '#ff5a4d', warning: '#ffb020', info: '#2ec16e' }

function Panel({ title, extra, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-borderd bg-panel p-5 ${className}`}>
      {title && (
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-head text-lg font-semibold text-white">{title}</h2>
          {extra && <span className="text-xs text-textmut">{extra}</span>}
        </div>
      )}
      {children}
    </div>
  )
}

function Kpi({ icon: Icon, label, value, accent, note }) {
  return (
    <div className="rounded-2xl border border-borderd bg-panel p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-textmut">{label}</span>
        <Icon className="h-5 w-5" style={{ color: accent }} aria-hidden="true" />
      </div>
      <div className="mt-2 font-head text-3xl font-extrabold" style={{ color: accent }}>{value}</div>
      {note && <div className="mt-1 text-xs text-textmut">{note}</div>}
    </div>
  )
}

export default function Dashboard() {
  const [alertsCount, setAlertsCount] = useState(kpis.activeAlerts)
  const [updated, setUpdated] = useState('just now')

  // simulate a "live" feed (demo only)
  useEffect(() => {
    const t = setInterval(() => {
      setAlertsCount((n) => Math.max(4, n + (Math.random() > 0.5 ? 1 : -1)))
      setUpdated('just now')
    }, 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="bg-ink">
      <Seo title="Live Dashboard — DeepSea Guardian" description="Real-time deep-ocean monitoring: detections, risk map, biodiversity and the Ocean Health Index." />
      <div className="mx-auto max-w-6xl px-4 py-10 text-white">
        {/* header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-head text-2xl font-bold sm:text-3xl">Live Ocean Monitoring</h1>
            <p className="mt-1 text-sm text-textmut">Real-time detection, biodiversity and risk across all active zones.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-panel px-4 py-2 text-sm">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-health" /> Live · updated {updated}
          </span>
        </div>

        {/* KPI row */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Kpi icon={AlertTriangle} label="Active Alerts" value={alertsCount} accent="#ff5a4d" note="live" />
          <Kpi icon={Trash2} label="Plastic Hotspots" value={kpis.plasticHotspots} accent="#ffb020" note="zones flagged" />
          <Kpi icon={Waypoints} label="Ghost Nets" value={kpis.ghostNets} accent="#ffffff" note="detected" />
          <Kpi icon={ThermometerSun} label="Bleaching Risk" value={kpis.bleachingRisk} accent="#ff5a4d" note="reef zone C-4" />
        </div>

        {/* map + gauge */}
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Panel title="Predictive Risk Map" extra="Heatmap · live drone track" className="lg:col-span-2">
            <OceanMap height={420} />
          </Panel>
          <Panel title="Ocean Health Index" extra="★ signature">
            <OceanHealthGauge score={fleetHealthIndex} size={230} />
            <div className="mt-4 space-y-2 text-sm text-textmut">
              <div className="flex items-center gap-2"><Radio className="h-4 w-4 text-health" /> {fleet.drones.online} drones online</div>
              <div className="flex items-center gap-2"><Radio className="h-4 w-4 text-health" /> {fleet.sensors.online} IoT sensors live</div>
              <div className="flex items-center gap-2"><Satellite className="h-4 w-4 text-warn" /> Satellite: {fleet.satellite.status}</div>
            </div>
          </Panel>
        </div>

        {/* feed + chart */}
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Panel title="AI Detection Feed" extra="auto-flagged" className="lg:col-span-2">
            <ul className="space-y-3">
              {detections.map((d) => (
                <li
                  key={d.id}
                  className="rounded-xl bg-ink2/60 p-3 pl-4"
                  style={{ borderLeft: `4px solid ${sevBorder[d.severity]}` }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-white">{d.type}{d.detail ? ` · ${d.detail}` : ''}</span>
                    <span className="shrink-0 text-xs text-textmut">{d.time}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-textmut">
                    Grid {d.zone}{d.confidence ? ` · confidence ${d.confidence}%` : ''}
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="7-Day Risk Index">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={riskTrend} margin={{ top: 10, right: 6, left: 6, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#12b5b0" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#12b5b0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#9fb6cc" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#0d1b2e', border: '1px solid #1d3d5c', borderRadius: 12, color: '#fff' }} />
                <Area type="monotone" dataKey="index" stroke="#4fd0cb" strokeWidth={2.5} fill="url(#riskFill)" />
              </AreaChart>
            </ResponsiveContainer>
            <p className="mt-2 text-xs text-textmut">Higher index = healthier ocean. Trending upward this week.</p>
          </Panel>
        </div>
      </div>
    </div>
  )
}
