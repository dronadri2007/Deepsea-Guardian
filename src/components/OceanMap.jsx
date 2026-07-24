import { zones as allZones, oceanHealthIndex } from '../data/mockData.js'

const riskColor = { high: '#ff5a4d', moderate: '#ffb020', low: '#12b5b0' }

// Lightweight styled map (no heavy map library) — protects Core Web Vitals.
export default function OceanMap({ zones = allZones, height = 420, showHeat = true }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-borderd"
      style={{
        height,
        background:
          'radial-gradient(circle at 30% 20%, #0e3a5f 0%, #0a2a45 55%, #081f36 100%)',
      }}
      role="img"
      aria-label="Ocean monitoring map with zone risk markers"
    >
      {/* faint depth contours */}
      <svg className="absolute inset-0 h-full w-full opacity-40" preserveAspectRatio="none" viewBox="0 0 100 100">
        <path d="M0 35 Q25 28 50 34 T100 30" fill="none" stroke="#17557f" strokeWidth="0.4" />
        <path d="M0 55 Q25 48 50 54 T100 50" fill="none" stroke="#17557f" strokeWidth="0.4" />
        <path d="M0 75 Q25 68 50 74 T100 70" fill="none" stroke="#17557f" strokeWidth="0.4" />
      </svg>

      {/* heat blobs */}
      {showHeat &&
        zones.map((z) => (
          <span
            key={`heat-${z.id}`}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: `${z.x}%`,
              top: `${z.y}%`,
              width: 140,
              height: 140,
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, ${riskColor[z.risk]}66 0%, transparent 70%)`,
            }}
          />
        ))}

      {/* markers */}
      {zones.map((z) => (
        <div
          key={z.id}
          className="group absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${z.x}%`, top: `${z.y}%` }}
        >
          <span
            className="block h-3.5 w-3.5 rounded-full ring-4 ring-white/10"
            style={{ background: riskColor[z.risk] }}
          />
          <div className="pointer-events-none absolute left-1/2 top-5 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink2 px-3 py-2 text-xs text-white shadow-lg group-hover:block">
            <div className="font-semibold">{z.name}</div>
            <div className="text-textmut">Health {oceanHealthIndex(z)} · {z.risk} risk</div>
          </div>
        </div>
      ))}

      {/* legend */}
      <div className="absolute bottom-3 left-3 flex gap-4 rounded-lg bg-ink2/80 px-3 py-2 text-xs text-white backdrop-blur">
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full" style={{ background: '#ff5a4d' }} />High</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full" style={{ background: '#ffb020' }} />Moderate</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full" style={{ background: '#12b5b0' }} />Monitored</span>
      </div>
    </div>
  )
}
