import { useState } from 'react'
import { Sparkles, Trash2, ThermometerSun, Waypoints, ShieldAlert, RotateCcw, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react'
import Seo from '../components/Seo.jsx'
import { Container, SectionHeading } from '../components/ui.jsx'
import OceanHealthGauge from '../components/OceanHealthGauge.jsx'
import { useApp } from '../context/AppContext.jsx'
import { healthBand, oceanHealthIndex, zones as initialZones } from '../data/mockData.js'

const riskSteps = ['low', 'moderate', 'high']
const sev4 = ['None', 'Low', 'Moderate', 'High']

// Real-world descriptors so the sliders mean something concrete
const plasticDesc = ['Pristine water', '~2 t/km² microplastics', '~8 t/km² accumulation', '~15+ t/km² heavy debris']
const bleachDesc = ['No thermal stress', '+0.5°C anomaly', '+1.2°C anomaly', '+1.8°C — bleaching onset']
const riskDesc = ['~12% incident probability', '~38% incident probability', '~71% incident probability']

function Slider({ icon: Icon, label, value, max, onChange, valueLabel, desc, accent }) {
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
        className="mt-2 w-full accent-teal cursor-pointer"
        aria-label={label}
      />
      {desc && <p className="mt-1 text-xs text-textd/55">{desc}</p>}
    </div>
  )
}

export default function Simulator() {
  const { zones, updateZoneReading, triggerPresetEvent, triggerSound } = useApp()
  const [zoneId, setZoneId] = useState(zones[0].id)
  
  const base = zones.find((z) => z.id === zoneId) || zones[0]

  const plastic = base.plastic
  const bleaching = base.bleaching
  const ghostNets = base.ghostNets
  const riskIdx = riskSteps.indexOf(base.risk)

  const originalZone = initialZones.find((z) => z.id === zoneId)
  const originalIndex = oceanHealthIndex(originalZone)
  const sim = oceanHealthIndex(base)
  const delta = sim - originalIndex
  const band = healthBand(sim)

  const insight =
    delta > 0
      ? `Reducing these pressures would raise ${base.name}'s Ocean Health Index by ${delta} points — from ${originalIndex} to ${sim} (${band.label}).`
      : delta < 0
      ? `These added pressures would drop the index by ${Math.abs(delta)} points, down to ${sim} (${band.label}).`
      : `No net change — the index holds at ${sim} (${band.label}).`

  // Estimated real-world impact
  const mag = Math.abs(delta)
  const impact = [
    { value: `${(mag * 120).toLocaleString()} ha`, label: 'Seafloor habitat affected' },
    { value: `${(mag * 45).toLocaleString()}/yr`, label: 'Marine animals impacted' },
    { value: `${(mag * 8).toLocaleString()} t`, label: 'Blue-carbon CO₂ at stake' },
  ]
  const outlook =
    sim >= 70 ? 'Full ecosystem recovery likely within 3–5 years.'
    : sim >= 40 ? 'Partial recovery possible with sustained intervention.'
    : 'Critical — risk of irreversible biodiversity loss without action.'

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
              onChange={(e) => {
                setZoneId(e.target.value)
                triggerSound('click')
              }}
              className="mt-2 w-full rounded-lg border border-teal/20 bg-sky/40 px-3 py-2.5 text-sm font-medium text-ink focus:border-teal focus:outline-none"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id}>{z.name} ({z.region})</option>
              ))}
            </select>

            <div className="mt-6 space-y-6">
              <Slider
                icon={Trash2}
                label="Plastic accumulation"
                value={plastic}
                max={3}
                onChange={(v) => {
                  updateZoneReading(zoneId, 'plastic', v)
                  triggerSound('click')
                }}
                valueLabel={sev4[plastic]}
                desc={plasticDesc[plastic]}
                accent="#ffb020"
              />
              <Slider
                icon={ThermometerSun}
                label="Coral bleaching"
                value={bleaching}
                max={3}
                onChange={(v) => {
                  updateZoneReading(zoneId, 'bleaching', v)
                  triggerSound('click')
                }}
                valueLabel={sev4[bleaching]}
                desc={bleachDesc[bleaching]}
                accent="#ff5a4d"
              />
              <Slider
                icon={Waypoints}
                label="Ghost nets"
                value={ghostNets}
                max={5}
                onChange={(v) => {
                  updateZoneReading(zoneId, 'ghostNets', v)
                  triggerSound('click')
                }}
                valueLabel={`${ghostNets} nets`}
                desc={`${ghostNets} net cluster${ghostNets !== 1 ? 's' : ''} · ~${(ghostNets * 0.6).toFixed(1)} t gear`}
                accent="#0b6d69"
              />
              <Slider
                icon={ShieldAlert}
                label="Predicted risk level"
                value={riskIdx}
                max={2}
                onChange={(v) => {
                  updateZoneReading(zoneId, 'risk', riskSteps[v])
                  triggerSound('click')
                }}
                valueLabel={riskSteps[riskIdx]}
                desc={riskDesc[riskIdx]}
                accent="#ff5a4d"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                // Reset this specific zone to default values
                const initZone = initialZones.find(iz => iz.id === zoneId)
                updateZoneReading(zoneId, 'plastic', initZone.plastic)
                updateZoneReading(zoneId, 'bleaching', initZone.bleaching)
                updateZoneReading(zoneId, 'ghostNets', initZone.ghostNets)
                updateZoneReading(zoneId, 'risk', initZone.risk)
                triggerSound('success')
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-teal/30 px-4 py-2 text-sm font-semibold text-tealink transition-colors hover:bg-teal/5"
            >
              <RotateCcw className="h-4 w-4" /> Reset to current readings
            </button>
          </div>

          {/* Result */}
          <div className="rounded-2xl border border-health/30 bg-ink p-6 text-white shadow-lg flex flex-col justify-between">
            <div>
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
                  <div className="font-head text-2xl font-bold text-textmut">{originalIndex}</div>
                </div>
                <ArrowRight className="h-5 w-5 text-textmut" />
                <div className="text-center">
                  <div className="text-xs text-textmut">Simulated</div>
                  <div className="font-head text-2xl font-bold" style={{ color: band.color }}>{sim}</div>
                </div>
                <div
                  className="ml-2 flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold animate-pulse"
                  style={{ color: delta >= 0 ? '#2ec16e' : '#ff5a4d', background: `${delta >= 0 ? '#2ec16e' : '#ff5a4d'}22` }}
                >
                  {delta > 0 ? <TrendingUp className="h-4 w-4" /> : delta < 0 ? <TrendingDown className="h-4 w-4" /> : null}
                  {delta > 0 ? `+${delta}` : delta}
                </div>
              </div>

              <p className="mt-5 rounded-xl bg-panel p-4 text-sm leading-relaxed text-textmut">{insight}</p>
            </div>

            {/* Estimated real-world impact */}
            <div className="mt-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-health">
                Estimated impact of this {delta >= 0 ? 'improvement' : 'decline'}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {impact.map((m) => (
                  <div key={m.label} className="rounded-xl bg-panel p-3 text-center border border-white/5">
                    <div className="font-head text-lg font-bold" style={{ color: band.color }}>{m.value}</div>
                    <div className="mt-0.5 text-[10px] leading-tight text-textmut">{m.label}</div>
                  </div>
                ))}
              </div>
              <p className="mt-3 rounded-xl border border-white/10 bg-panel/60 p-3 text-xs text-textmut">
                <span className="font-semibold text-white">Recovery outlook:</span> {outlook}
              </p>
            </div>
          </div>
        </div>

        {/* ── Preset Disaster Console ── */}
        <div className="rounded-2xl border border-teal/15 bg-white p-6 shadow-sm mt-6">
          <h3 className="font-head text-lg font-bold text-ink mb-2 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-alert" /> Disaster Simulation Console
          </h3>
          <p className="text-xs text-textd/70 mb-5">
            Manually trigger severe environmental events to test target alert levels and watch the entire dashboard and threat feed react in real time.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => triggerPresetEvent('oil-spill')}
              className="flex flex-col items-center justify-center p-4 border border-red-200 bg-red-50 hover:bg-red-100/70 hover:border-red-300 rounded-xl text-center transition-all active:scale-98 group cursor-pointer"
            >
              <span className="font-extrabold text-xs text-red-800 uppercase tracking-wider mb-1">Trigger Oil Spill</span>
              <span className="text-[10px] text-red-650 font-medium">Zone C-4 Plastic Hotspot &rarr; Max (Critical)</span>
            </button>

            <button
              type="button"
              onClick={() => triggerPresetEvent('marine-heatwave')}
              className="flex flex-col items-center justify-center p-4 border border-amber-200 bg-amber-50 hover:bg-amber-100/70 hover:border-amber-300 rounded-xl text-center transition-all active:scale-98 group cursor-pointer"
            >
              <span className="font-extrabold text-xs text-amber-800 uppercase tracking-wider mb-1">Trigger Heatwave</span>
              <span className="text-[10px] text-amber-650 font-medium">Zone A-7 Coral Bleaching &rarr; Max (Critical)</span>
            </button>

            <button
              type="button"
              onClick={() => triggerPresetEvent('ghost-net-trawl')}
              className="flex flex-col items-center justify-center p-4 border border-teal-200 bg-teal-55/30 hover:bg-teal-55/50 hover:border-teal-300 rounded-xl text-center transition-all active:scale-98 group cursor-pointer"
            >
              <span className="font-extrabold text-xs text-teal-850 uppercase tracking-wider mb-1">Trigger Ghost Trawler</span>
              <span className="text-[10px] text-teal-700 font-medium">Zone D-1 Ghost Nets &rarr; Max (High)</span>
            </button>
          </div>
        </div>
      </Container>
    </div>
  )
}
