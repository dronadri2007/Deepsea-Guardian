import { useState } from 'react'
import { Sparkles, Trash2, ThermometerSun, Waypoints, ShieldAlert, RotateCcw, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react'
import Seo from '../components/Seo.jsx'
import { Container, SectionHeading } from '../components/ui.jsx'
import OceanHealthGauge from '../components/OceanHealthGauge.jsx'
import { zones, oceanHealthIndex, healthBand } from '../data/mockData.js'

const riskSteps = ['low', 'moderate', 'high']
const sev4 = ['None', 'Low', 'Moderate', 'High']

function Slider({ icon: Icon, label, value, max, onChange, valueLabel, accent }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Icon className="h-4 w-4" style={{ color: accent }} aria-hidden="true" /> {label}
        </span>
        <span className="rounded-full bg-teal/10 px-2.5 py-0.5 text-xs font-semibold text-tealink">{valueLabel}</span>
      </div>
      <input
        type="range"
        min="0"
        max={max}
        step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-teal"
        aria-label={label}
      />
    </div>
  )
}

export default function Simulator() {
  const [zoneId, setZoneId] = useState(zones[0].id)
  const base = zones.find((z) => z.id === zoneId)

  const [plastic, setPlastic] = useState(base.plastic)
  const [bleaching, setBleaching] = useState(base.bleaching)
  const [ghostNets, setGhostNets] = useState(base.ghostNets)
  const [riskIdx, setRiskIdx] = useState(riskSteps.indexOf(base.risk))

  function selectZone(id) {
    const z = zones.find((x) => x.id === id)
    setZoneId(id)
    setPlastic(z.plastic)
    setBleaching(z.bleaching)
    setGhostNets(z.ghostNets)
    setRiskIdx(riskSteps.indexOf(z.risk))
  }

  const original = oceanHealthIndex(base)
  const sim = oceanHealthIndex({ plastic, bleaching, ghostNets, risk: riskSteps[riskIdx] })
  const delta = sim - original
  const band = healthBand(sim)

  const insight =
    delta > 0
      ? `Reducing these pressures would raise ${base.name}'s Ocean Health Index by ${delta} points — from ${original} to ${sim} (${band.label}).`
      : delta < 0
      ? `These added pressures would drop the index by ${Math.abs(delta)} points, down to ${sim} (${band.label}).`
      : `No net change — the index holds at ${sim} (${band.label}).`

  return (
    <div className="py-14">
      <Seo
        title="What-If Simulator — DeepSea Guardian"
        description="Interactively model how reducing plastic, bleaching, ghost nets and risk changes a zone's Ocean Health Index in real time."
      />
      <Container>
        <SectionHeading
          eyebrow="★ Interactive signature"
          title="What-If Ocean Health Simulator"
          subtitle="Adjust the threats in any zone and watch the Ocean Health Index recompute live. See exactly how much cleaner oceans would move the needle — before spending a rupee on cleanup."
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Controls */}
          <div className="rounded-2xl border border-teal/15 bg-white p-6 shadow-sm">
            <label className="text-sm font-semibold text-ink" htmlFor="zone-select">Select a zone</label>
            <select
              id="zone-select"
              value={zoneId}
              onChange={(e) => selectZone(e.target.value)}
              className="mt-2 w-full rounded-lg border border-teal/20 bg-sky/40 px-3 py-2.5 text-sm font-medium text-ink focus:border-teal focus:outline-none"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id}>{z.name} ({z.region})</option>
              ))}
            </select>

            <div className="mt-6 space-y-6">
              <Slider icon={Trash2} label="Plastic accumulation" value={plastic} max={3} onChange={setPlastic} valueLabel={sev4[plastic]} accent="#ffb020" />
              <Slider icon={ThermometerSun} label="Coral bleaching" value={bleaching} max={3} onChange={setBleaching} valueLabel={sev4[bleaching]} accent="#ff5a4d" />
              <Slider icon={Waypoints} label="Ghost nets" value={ghostNets} max={5} onChange={setGhostNets} valueLabel={`${ghostNets} nets`} accent="#0b6d69" />
              <Slider icon={ShieldAlert} label="Predicted risk level" value={riskIdx} max={2} onChange={setRiskIdx} valueLabel={riskSteps[riskIdx]} accent="#ff5a4d" />
            </div>

            <button
              type="button"
              onClick={() => selectZone(zoneId)}
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-teal/30 px-4 py-2 text-sm font-semibold text-tealink transition-colors hover:bg-teal/5"
            >
              <RotateCcw className="h-4 w-4" /> Reset to current readings
            </button>
          </div>

          {/* Result */}
          <div className="rounded-2xl border border-health/30 bg-ink p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 text-sm font-semibold text-health">
              <Sparkles className="h-4 w-4" /> Projected Ocean Health Index
            </div>

            <div className="mt-2 flex justify-center">
              <OceanHealthGauge score={sim} size={260} />
            </div>

            {/* before / after */}
            <div className="mt-4 flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-xs text-textmut">Current</div>
                <div className="font-head text-2xl font-bold text-textmut">{original}</div>
              </div>
              <ArrowRight className="h-5 w-5 text-textmut" />
              <div className="text-center">
                <div className="text-xs text-textmut">Simulated</div>
                <div className="font-head text-2xl font-bold" style={{ color: band.color }}>{sim}</div>
              </div>
              <div
                className="ml-2 flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold"
                style={{ color: delta >= 0 ? '#2ec16e' : '#ff5a4d', background: `${delta >= 0 ? '#2ec16e' : '#ff5a4d'}22` }}
              >
                {delta > 0 ? <TrendingUp className="h-4 w-4" /> : delta < 0 ? <TrendingDown className="h-4 w-4" /> : null}
                {delta > 0 ? `+${delta}` : delta}
              </div>
            </div>

            <p className="mt-5 rounded-xl bg-panel p-4 text-sm leading-relaxed text-textmut">{insight}</p>

            <p className="mt-3 text-center text-xs text-textmut/60">
              Powered by the same Ocean Health Index model used across the platform.
            </p>
          </div>
        </div>
      </Container>
    </div>
  )
}
