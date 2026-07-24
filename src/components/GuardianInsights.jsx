import { useEffect, useState } from 'react'
import { Sparkles, RefreshCw, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react'
import { zones, oceanHealthIndex, healthBand, fleetHealthIndex, detections, species } from '../data/mockData.js'

// ── Derive plain-language findings + recommendations from the live data ──
function dominantThreat(z) {
  const opts = [
    { key: 'plastic', v: z.plastic, phrase: 'heavy plastic accumulation', action: 'Dispatch a plastic-cleanup unit' },
    { key: 'bleaching', v: z.bleaching, phrase: 'coral bleaching stress', action: 'Deploy thermal sensors and alert reef authorities' },
    { key: 'ghostNets', v: Math.min(z.ghostNets, 3), phrase: 'ghost-net clusters', action: 'Schedule a net-retrieval operation' },
    { key: 'risk', v: { low: 1, moderate: 2, high: 3 }[z.risk], phrase: 'elevated predicted risk', action: 'Increase drone survey frequency' },
  ]
  return opts.sort((a, b) => b.v - a.v)[0]
}

function analyze() {
  const scored = zones.map((z) => ({ ...z, score: oceanHealthIndex(z), band: healthBand(oceanHealthIndex(z)).label }))
  const critical = scored.filter((z) => z.score < 40)
  const moderate = scored.filter((z) => z.score >= 40 && z.score < 70)
  const good = scored.filter((z) => z.score >= 70)
  const worst = [...scored].sort((a, b) => a.score - b.score)[0]
  const best = [...scored].sort((a, b) => b.score - a.score)[0]
  const dumping = detections.filter((d) => d.type.toLowerCase().includes('dumping'))
  const ghostTotal = zones.reduce((s, z) => s + z.ghostNets, 0)
  const endangered = species.filter((s) => s.status.includes('Endangered')).length

  const band = healthBand(fleetHealthIndex).label
  const summary = `Fleet Ocean Health Index is ${fleetHealthIndex}/100 (${band}). ${critical.length} zone${critical.length !== 1 ? 's' : ''} critical, ${moderate.length} moderate, ${good.length} healthy.`

  const findings = []
  const wt = dominantThreat(worst)
  findings.push(`${worst.name} is the most at-risk zone (index ${worst.score}), driven by ${wt.phrase}.`)
  if (dumping.length) findings.push(`Illegal dumping detected in Grid ${dumping[0].zone} at ${dumping[0].confidence}% confidence — requires enforcement.`)
  if (ghostTotal) findings.push(`${ghostTotal} ghost-net clusters detected across zones — a persistent entanglement threat.`)
  findings.push(`${endangered} endangered species actively tracked; sightings concentrated near lower-risk zones.`)
  findings.push(`${best.name} remains the healthiest zone (index ${best.score}) — a useful recovery benchmark.`)

  const recs = []
  critical.forEach((z) => recs.push(`${z.id}: ${dominantThreat(z).action}.`))
  if (dumping.length) recs.push(`Flag Grid ${dumping[0].zone} for maritime enforcement review.`)
  if (!recs.length) recs.push('Maintain current monitoring cadence — no critical intervention required.')

  return { summary, findings, recs: recs.slice(0, 3) }
}

export default function GuardianInsights() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  function run() {
    setLoading(true)
    const t = setTimeout(() => {
      setData(analyze())
      setLoading(false)
    }, 900)
    return () => clearTimeout(t)
  }

  useEffect(() => run(), [])

  return (
    <div className="relative overflow-hidden rounded-2xl border border-teal/40 bg-panel p-5">
      {/* accent glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-teal/20 blur-3xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal/20">
            <Sparkles className="h-5 w-5 text-teallite" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-head text-lg font-bold text-white">Guardian AI</h2>
            <p className="text-xs text-textmut">Automated analysis of live ocean data</p>
          </div>
        </div>
        <button
          type="button"
          onClick={run}
          className="inline-flex items-center gap-1.5 rounded-lg border border-teal/40 px-3 py-1.5 text-xs font-semibold text-teallite transition-colors hover:bg-teal/10"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Re-analyze
        </button>
      </div>

      {loading || !data ? (
        <div className="relative mt-5 space-y-2" aria-live="polite">
          <div className="flex items-center gap-2 text-sm text-teallite">
            <span className="h-2 w-2 animate-pulse rounded-full bg-teallite" /> Analyzing sensor, drone &amp; detection data…
          </div>
          <div className="h-3 w-3/4 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-white/10" />
        </div>
      ) : (
        <div className="relative mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-white">{data.summary}</p>
            <ul className="mt-3 space-y-2">
              {data.findings.map((f, i) => (
                <li key={i} className="flex gap-2 text-sm text-textmut">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warn" aria-hidden="true" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-teal/20 bg-ink2/60 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-teallite">
              <CheckCircle2 className="h-4 w-4" /> Recommended actions
            </div>
            <ul className="space-y-2">
              {data.recs.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm text-white">
                  <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
