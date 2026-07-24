import { useEffect, useRef, useState } from 'react'
import { Sparkles, Radio, Satellite, Volume2, Target } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { healthBand, oceanHealthIndex } from '../data/mockData.js'

const riskColor = { high: '#ff5a4d', moderate: '#ffb020', low: '#12b5b0' }
const sevLabel = ['None', 'Low', 'Moderate', 'High']
const LAYERS = [
  { key: 'all', label: 'All' },
  { key: 'drones', label: 'Drones' },
  { key: 'sonar', label: 'Sonar' },
  { key: 'satellite', label: 'Satellite' },
  { key: 'iot', label: 'IoT' },
]

// ─────────────────────────────────────────────────────────────────────────────
//  Noise helpers for realistic geological FBM noise
// ─────────────────────────────────────────────────────────────────────────────
function hash(ix, iy) {
  const n = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453
  return n - Math.floor(n)
}

function vnoise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y)
  const fx = x - ix,        fy = y - iy
  const ux = fx * fx * (3 - 2 * fx)
  const uy = fy * fy * (3 - 2 * fy)
  return (
    hash(ix,     iy    ) * (1 - ux) * (1 - uy) +
    hash(ix + 1, iy    ) *      ux  * (1 - uy) +
    hash(ix,     iy + 1) * (1 - ux) *      uy  +
    hash(ix + 1, iy + 1) *      ux  *      uy
  )
}

function fbm(x, y, octaves = 4) {
  let v = 0, a = 0.5, f = 1
  for (let i = 0; i < octaves; i++) {
    v += vnoise(x * f, y * f) * a
    a *= 0.5
    f *= 2.1
  }
  return v
}

function rfbm(x, y, octaves = 5) {
  let v = 0, a = 0.5, f = 1
  for (let i = 0; i < octaves; i++) {
    const n = 1 - Math.abs(2 * vnoise(x * f, y * f) - 1)
    v += n * n * a
    a *= 0.5
    f *= 2.1
  }
  return v
}

// ─────────────────────────────────────────────────────────────────────────────
//  NOAA Bathymetric Color Ramp
// ─────────────────────────────────────────────────────────────────────────────
function bathyRGB(t) {
  const stops = [
    [0.00, [ 16,  46, 170]],   // deep royal blue
    [0.16, [ 20,  74, 208]],   // bright ocean blue
    [0.32, [ 26, 120, 214]],   // lighter blue
    [0.46, [ 30, 164, 196]],   // blue-cyan slope
    [0.58, [ 34, 190, 168]],   // cyan-teal
    [0.68, [ 44, 200, 120]],   // teal-green
    [0.78, [ 70, 204,  78]],   // grass green shelf
    [0.88, [120, 214,  58]],   // bright green ridge
    [1.00, [180, 226,  74]],   // yellow-green highlight
  ]
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, c0] = stops[i]
    const [t1, c1] = stops[i + 1]
    if (t <= t1) {
      const f = (t - t0) / (t1 - t0)
      return [
        c0[0] + f * (c1[0] - c0[0]),
        c0[1] + f * (c1[1] - c0[1]),
        c0[2] + f * (c1[2] - c0[2]),
      ]
    }
  }
  return stops[stops.length - 1][1]
}

const clamp255 = v => v < 0 ? 0 : v > 255 ? 255 : v | 0

// ─────────────────────────────────────────────────────────────────────────────
//  Geologically Realistic Heightmap Calculation
// ─────────────────────────────────────────────────────────────────────────────
function generateHeightMap(W, H) {
  const hmap = new Float32Array(W * H)
  let hMin = Infinity, hMax = -Infinity

  for (let y = 0; y < H; y++) {
    const ny = y / H
    for (let x = 0; x < W; x++) {
      const nx = x / W
      const sx = nx * 3.2, sy = ny * 3.2

      const qx = fbm(sx, sy, 3), qy = fbm(sx + 5.2, sy + 1.3, 3)
      const rx = fbm(sx + 4 * qx + 1.7, sy + 4 * qy + 9.2, 3)
      const ry = fbm(sx + 4 * qx + 8.3, sy + 4 * qy + 2.8, 3)
      const big = fbm(sx + 4 * rx, sy + 4 * ry, 4)
      const elev = Math.pow(Math.max(0, big), 1.35)

      let m = Math.max(0, Math.min(1, (big - 0.42) / 0.28))
      const mtnMask = m * m * (3 - 2 * m)
      const ridges = (rfbm(sx * 2.4 + rx * 3, sy * 2.4 + ry * 3, 5) - 0.35) * 0.55 * mtnMask

      const trenchX = 0.30 + 0.12 * Math.sin(ny * Math.PI * 1.4)
      const dist = Math.abs(nx - trenchX)
      const trench = -0.22 * Math.exp(-Math.pow(dist / 0.045, 2))

      const fine = (fbm(sx * 7.5, sy * 7.5, 3) - 0.5) * 0.06

      const h = elev * 0.85 + ridges + trench + fine

      hmap[y * W + x] = h
      if (h < hMin) hMin = h
      if (h > hMax) hMax = h
    }
  }
  return { hmap, hMin, hMax }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Hillshading Pass (Instant draw using cached heightmap & variable sun angle)
// ─────────────────────────────────────────────────────────────────────────────
function drawShading(canvas, heightMapData, lightAngleDeg) {
  const W = canvas.width
  const H = canvas.height
  const ctx = canvas.getContext('2d')
  if (!ctx || !heightMapData) return

  const { hmap, hMin, hMax } = heightMapData
  const img = ctx.createImageData(W, H)
  const d = img.data

  // Convert light angle to 3D vector coordinates
  const angleRad = (lightAngleDeg * Math.PI) / 180
  const lx = Math.cos(angleRad)
  const ly = Math.sin(angleRad)
  const lz = 0.50
  const lLen = Math.sqrt(lx*lx + ly*ly + lz*lz)

  const hvx = lx/lLen, hvy = ly/lLen, hvz = lz/lLen + 1.0
  const hvLen = Math.sqrt(hvx*hvx + hvy*hvy + hvz*hvz)

  const hRange = hMax - hMin
  const surfScale = 16.0 / hRange

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const h = (hmap[y * W + x] - hMin) / hRange

      const hL = hmap[y * W + Math.max(0, x - 1)]
      const hR = hmap[y * W + Math.min(W - 1, x + 1)]
      const hU = hmap[Math.max(0, y - 1) * W + x]
      const hD = hmap[Math.min(H - 1, y + 1) * W + x]

      const nxn = -(hR - hL) * surfScale
      const nyn = -(hD - hU) * surfScale
      const nzn = 1.0
      const nLen = Math.sqrt(nxn*nxn + nyn*nyn + nzn*nzn)

      const diff = Math.max(0,
        nxn/nLen * lx/lLen +
        nyn/nLen * ly/lLen +
        nzn/nLen * lz/lLen
      )

      const spec = Math.pow(Math.max(0,
        nxn/nLen * hvx/hvLen +
        nyn/nLen * hvy/hvLen +
        nzn/nLen * hvz/hvLen
      ), 50)

      const [r0, g0, b0] = bathyRGB(h)
      const shade = 0.42 + diff * 0.66

      let r = r0 * shade + spec * 90
      let g = g0 * shade + spec * 110
      let b = b0 * shade + spec * 150

      const vdx = (x / W - 0.5) * 2
      const vdy = (y / H - 0.5) * 2
      const vig = 1.0 - Math.max(0, Math.sqrt(vdx*vdx + vdy*vdy) * 0.35 - 0.05) * 0.40

      const i = (y * W + x) << 2
      d[i]     = clamp255(r * vig)
      d[i + 1] = clamp255(g * vig)
      d[i + 2] = clamp255(b * vig)
      d[i + 3] = 255
    }
  }

  ctx.putImageData(img, 0, 0)
}

// ─────────────────────────────────────────────────────────────────────────────
//  Component Definition
// ─────────────────────────────────────────────────────────────────────────────
export default function OceanMap({ height = 420, showHeat = true }) {
  const canvasRef = useRef(null)
  const heightMapRef = useRef(null)
  const [selected, setSelected] = useState(null)
  const [layer, setLayer] = useState('all')
  const [selectedDrone, setSelectedDrone] = useState(null)

  const {
    zones,
    detections,
    drones,
    lightAngle,
    setLightAngle,
    redirectDrone,
    triggerSound,
    setActiveReport,
  } = useApp()

  // Generate and cache terrain, then draw first shading pass
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Cache the heavy heightmap on mount
    const mapData = generateHeightMap(canvas.width, canvas.height)
    heightMapRef.current = mapData

    drawShading(canvas, mapData, lightAngle)
  }, [])

  // Re-draw shading instantaneously when sun angle updates
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !heightMapRef.current) return
    drawShading(canvas, heightMapRef.current, lightAngle)
  }, [lightAngle])

  const handleDroneClick = (drone) => {
    triggerSound('click')
    if (drone.status === 'patrolling' || drone.status === 'scanning') {
      return // Busy
    }
    setSelectedDrone(drone)
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-white/10"
      style={{ height, background: '#020b60' }}
      role="img"
      aria-label="Bathymetric sonar map of monitored deep-sea zones with predictive risk heatmap and drone survey tracks"
    >
      {/* ── Canvas Terrain layer ── */}
      <canvas
        ref={canvasRef}
        width={640}
        height={384}
        className="absolute inset-0 h-full w-full"
        style={{ imageRendering: 'auto' }}
        aria-hidden="true"
      />

      {/* ── SVG overlays (animated pathways) ── */}
      <svg
        className="absolute inset-0 h-full w-full pointer-events-none"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter id="sg" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5.5" result="b1"/>
            <feGaussianBlur in="SourceGraphic" stdDeviation="13"   result="b2"/>
            <feMerge>
              <feMergeNode in="b2"/>
              <feMergeNode in="b1"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <style>{`
            @keyframes sd1 { from { stroke-dashoffset: 1300; } to { stroke-dashoffset: 0; } }
            @keyframes sd2 { from { stroke-dashoffset: 1400; } to { stroke-dashoffset: 0; } }
            .sc1 { stroke-dasharray: 1300; animation: sd1 12s linear infinite; }
            .sc2 { stroke-dasharray: 1400; animation: sd2 15s linear infinite 2s; }
            @media (prefers-reduced-motion: reduce) {
              .sc1, .sc2 { animation: none; stroke-dashoffset: 0; }
            }
          `}</style>
        </defs>

        {/* ── Path A ── */}
        <path
          className="sc1"
          d="M 230 130 L 580 540"
          fill="none"
          stroke="#388eff"
          strokeWidth="6"
          strokeLinecap="round"
          filter="url(#sg)"
          opacity="0.8"
        />
        <path
          className="sc1"
          d="M 230 130 L 580 540"
          fill="none"
          stroke="#d2e5ff"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.95"
        />

        {/* ── Path B ── */}
        <path
          className="sc2"
          d="M 350 50 Q 280 50, 290 85 T 350 100 Q 425 100, 425 160 Q 425 200, 455 220 Q 495 220, 495 285 Q 495 325, 545 345 Q 615 345, 615 405 Q 615 445, 665 465 Q 725 465, 735 520"
          fill="none"
          stroke="#00e5ff"
          strokeWidth="5"
          strokeLinecap="round"
          filter="url(#sg)"
          opacity="0.75"
        />
        <path
          className="sc2"
          d="M 350 50 Q 280 50, 290 85 T 350 100 Q 425 100, 425 160 Q 425 200, 455 220 Q 495 220, 495 285 Q 495 325, 545 345 Q 615 345, 615 405 Q 615 445, 665 465 Q 725 465, 735 520"
          fill="none"
          stroke="#e0faff"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Dynamic target trace line when dragging or routing drone */}
        {selectedDrone && (
          <line
            x1={`${selectedDrone.x}%`}
            y1={`${selectedDrone.y}%`}
            x2="50%"
            y2="50%"
            className="hidden"
          />
        )}
      </svg>

      {/* ── Source-layer toggle ── */}
      <div className="absolute left-3 top-3 z-30 flex flex-wrap gap-1 rounded-xl border border-white/10 bg-black/55 p-1 backdrop-blur-sm">
        {LAYERS.map((l) => (
          <button
            key={l.key}
            type="button"
            onClick={() => {
              setLayer(l.key)
              setSelected(null)
              setSelectedDrone(null)
              triggerSound('click')
            }}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              layer === l.key ? 'bg-teal text-white' : 'text-white/70 hover:bg-white/10'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* ── Active Drone Redirection Status Banner ── */}
      {selectedDrone && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 bg-teal/95 border border-white/20 text-white rounded-xl px-4 py-2 flex items-center gap-3 shadow-2xl backdrop-blur-sm">
          <Target className="h-4 w-4 animate-spin text-teallite" />
          <span className="text-[11px] font-semibold">
            Click any Monitored Zone marker to dispatch <b>{selectedDrone.id}</b>
          </span>
          <button
            type="button"
            onClick={() => setSelectedDrone(null)}
            className="text-white/80 hover:text-white font-bold text-[10px] ml-1 bg-white/15 px-2 py-0.5 rounded"
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── Heat blobs ── */}
      {layer === 'all' && showHeat && zones.map((z) => (
        <span
          key={`heat-${z.id}`}
          className="pointer-events-none absolute rounded-full transition-all duration-550"
          style={{
            left: `${z.x}%`, top: `${z.y}%`,
            width: 170, height: 170,
            transform: 'translate(-50%,-50%)',
            background: `radial-gradient(circle,${riskColor[z.risk]}80 0%,${riskColor[z.risk]}28 42%,transparent 68%)`,
          }}
        />
      ))}

      {/* ── Satellite orbital pass ── */}
      {layer === 'satellite' && (
        <div
          className="pointer-events-none absolute left-0 w-full"
          style={{
            top: '12%',
            height: '34%',
            background: 'linear-gradient(180deg, transparent, rgba(79,208,203,0.08), transparent)',
            borderTop: '1px dashed rgba(79,208,203,0.3)',
            borderBottom: '1px dashed rgba(79,208,203,0.3)',
          }}
        />
      )}

      {/* ── Drones patrol paths ── */}
      {layer === 'drones' && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          <polyline
            points={drones.map((d) => `${d.x}%,${d.y}%`).join(' ')}
            fill="none" stroke="#4fd0cb" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.4"
          />
        </svg>
      )}

      {/* ── Drones markers ── */}
      {layer === 'drones' && drones.map((d) => {
        const isBusy = d.status === 'patrolling' || d.status === 'scanning'
        const isSelected = selectedDrone?.id === d.id
        return (
          <button
            key={d.id}
            type="button"
            onClick={() => handleDroneClick(d)}
            disabled={isBusy}
            className={`group absolute -translate-x-1/2 -translate-y-1/2 p-2 focus:outline-none ${isBusy ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            style={{ left: `${d.x}%`, top: `${d.y}%` }}
          >
            {d.status === 'scanning' && (
              <span className="absolute -inset-1 animate-ping rounded-full border border-teal" />
            )}
            <span
              className={`grid h-7 w-7 place-items-center rounded-full border font-bold text-xs transition-all ${
                isSelected
                  ? 'border-white bg-teal text-white scale-125 ring-4 ring-teal/30'
                  : isBusy
                  ? 'border-white/20 bg-panel/80 text-textmut'
                  : 'border-white/40 bg-ink2/85 text-teallite hover:scale-110 hover:border-white'
              }`}
              style={{ boxShadow: '0 0 10px 2px rgba(79,208,203,0.4)' }}
            >
              ▲
            </span>
            <div className="pointer-events-none absolute left-1/2 top-9 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/15 bg-ink2/95 px-2.5 py-1.5 text-[10px] text-white shadow-xl group-hover:block">
              <b className="text-teallite">{d.id}</b><br />
              Status: <span className="capitalize">{d.status}</span><br />
              Battery: {d.battery}%
              {!isBusy && <div className="mt-1 text-center font-bold text-teal text-[9px]">CLICK TO REDIRECT</div>}
            </div>
          </button>
        )
      })}

      {/* ── Sonar layer ── */}
      {layer === 'sonar' && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          {zones.map((z) => (
            <circle
              key={`sonar-c-${z.id}`}
              cx={`${z.x}%`}
              cy={`${z.y}%`}
              r={z.ghostNets * 12 + 10}
              fill="none"
              stroke="#67e8f9"
              strokeWidth="1"
              strokeDasharray="2 3"
              opacity="0.3"
            />
          ))}
        </svg>
      )}
      {layer === 'sonar' && zones.map((z) => (
        <div key={`sonar-${z.id}`} className="group absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${z.x}%`, top: `${z.y}%` }}>
          <span className="absolute -inset-3 animate-ping rounded-full border border-cyan-300/30" />
          <span className="block h-2.5 w-2.5 rounded-full bg-cyan-300" style={{ boxShadow: '0 0 8px 2px rgba(103,232,249,0.7)' }} />
          <div className="pointer-events-none absolute left-1/2 top-5 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/15 bg-ink2/95 px-2.5 py-1.5 text-[10px] text-white shadow-xl group-hover:block">
            Sonar telemetry: {z.name}<br />
            Ghost nets flagged: {z.ghostNets}
          </div>
        </div>
      ))}

      {/* ── Satellite layer ── */}
      {layer === 'satellite' && [
        { id: 'S1', x: 34, y: 30, label: 'Algal Bloom hazard' },
        { id: 'S2', x: 62, y: 38, label: 'Turbidity plume' },
      ].map((f) => (
        <div key={f.id} className="group absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${f.x}%`, top: `${f.y}%` }}>
          <span className="block h-3 w-3 rotate-45 border-2 border-white bg-warn" />
          <div className="pointer-events-none absolute left-1/2 top-5 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/15 bg-ink2/95 px-2.5 py-1.5 text-xs text-white shadow-xl group-hover:block">
            Satellite Flag: {f.label}
          </div>
        </div>
      ))}

      {/* ── IoT layer ── */}
      {layer === 'iot' && zones.map((z) => (
        <div key={`iot-${z.id}`} className="group absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${z.x}%`, top: `${z.y}%` }}>
          <span className="block h-2.5 w-2.5 rounded-sm bg-health" style={{ boxShadow: '0 0 8px 2px rgba(46,193,110,0.6)' }} />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-black/60 px-1.5 py-0.5 text-[9px] text-white">pH {(8.0 - z.plastic * 0.1).toFixed(1)}</span>
          <div className="pointer-events-none absolute left-1/2 top-5 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/15 bg-ink2/95 px-2.5 py-1.5 text-xs text-white shadow-xl group-hover:block">
            <b>IoT-Node {z.id}</b><br />
            pH: {(8.0 - z.plastic * 0.1).toFixed(1)} · Temp Anomaly: +{z.bleaching * 0.6}°C
          </div>
        </div>
      ))}

      {/* ── Zone markers (clickable) — All view ── */}
      {(layer === 'all' || selectedDrone) && zones.map((z) => {
        const score = oceanHealthIndex(z)
        const isPulse = selectedDrone ? 'animate-pulse scale-125' : ''
        return (
          <button
            type="button"
            key={z.id}
            onClick={() => {
              if (selectedDrone) {
                redirectDrone(selectedDrone.id, z.id)
                setSelectedDrone(null)
              } else {
                setSelected(z)
                triggerSound('click')
              }
            }}
            aria-label={`Zone ${z.name}, health ${score}, ${z.risk} risk`}
            className={`group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${selected?.id === z.id ? 'z-20' : ''} ${isPulse}`}
            style={{ left: `${z.x}%`, top: `${z.y}%` }}
          >
            <span
              className="absolute -inset-2 animate-ping rounded-full opacity-25"
              style={{ background: riskColor[z.risk] }}
            />
            <span
              className="relative block h-3.5 w-3.5 rounded-full transition-transform group-hover:scale-125"
              style={{
                background: riskColor[z.risk],
                boxShadow: `0 0 10px 4px ${riskColor[z.risk]}70, 0 0 0 2px #ffffff${selected?.id === z.id ? 'cc' : '22'}`,
              }}
            />
            {!selectedDrone && (
              <div className="pointer-events-none absolute left-1/2 top-5 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/15 bg-ink2/95 px-3 py-2 text-xs text-white shadow-xl backdrop-blur-sm group-hover:block">
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-ink2/95"/>
                <div className="font-semibold">{z.name}</div>
                <div className="mt-0.5 text-textmut">
                  Health {score} ·{' '}
                  <span style={{ color: riskColor[z.risk] }}>{z.risk} risk</span> · click for details
                </div>
              </div>
            )}
          </button>
        )
      })}

      {/* ── Zone detail panel (slides in on click) ── */}
      {selected && (() => {
        const score = oceanHealthIndex(selected)
        const band = healthBand(score)
        const related = detections.filter((d) => d.zone === selected.id)
        const bars = [
          { label: 'Plastic', v: selected.plastic, max: 3, txt: sevLabel[selected.plastic] },
          { label: 'Bleaching', v: selected.bleaching, max: 3, txt: sevLabel[selected.bleaching] },
          { label: 'Ghost nets', v: selected.ghostNets, max: 5, txt: `${selected.ghostNets}` },
        ]
        return (
          <div className="absolute inset-y-0 right-0 z-30 w-full max-w-[280px] overflow-y-auto border-l border-white/10 bg-ink2/95 p-4 text-white shadow-2xl backdrop-blur-md">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-textmut">Zone {selected.id}</div>
                <h3 className="font-head text-base font-bold leading-tight">{selected.name}</h3>
                <div className="text-xs text-textmut">{selected.region}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelected(null)
                  triggerSound('click')
                }}
                aria-label="Close zone details"
                className="rounded-lg p-1 text-textmut hover:bg-white/10 hover:text-white"
              >✕</button>
            </div>

            <div className="mt-4 flex items-end gap-2">
              <span className="font-head text-4xl font-extrabold" style={{ color: band.color }}>{score}</span>
              <span className="pb-1 text-xs text-textmut">/100 · {band.label}</span>
            </div>
            <div className="mt-1 text-[11px] text-textmut">Ocean Health Index</div>

            <div className="mt-4 space-y-2.5">
              {bars.map((b) => (
                <div key={b.label}>
                  <div className="flex justify-between text-[11px] text-textmut">
                    <span>{b.label}</span><span>{b.txt}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full" style={{ width: `${(b.v / b.max) * 100}%`, background: band.color }} />
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-textmut">Predicted risk</span>
                <span className="font-semibold capitalize" style={{ color: riskColor[selected.risk] }}>{selected.risk}</span>
              </div>
            </div>

            {/* AI Report Button */}
            <button
              type="button"
              onClick={() => {
                setActiveReport({
                  type: 'zone',
                  id: selected.id,
                  name: selected.name,
                  metrics: { score, band: band.label, risk: selected.risk, plastic: selected.plastic, bleaching: selected.bleaching, nets: selected.ghostNets }
                })
                triggerSound('click')
              }}
              className="mt-5 w-full rounded-xl bg-teal px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-teal/80 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Generate AI Report
            </button>

            <div className="mt-4 border-t border-white/10 pt-3">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-textmut">Recent detections</div>
              {related.length ? (
                <ul className="space-y-1.5">
                  {related.map((d) => (
                    <li key={d.id} className="rounded-lg bg-white/5 px-2.5 py-1.5 text-xs">
                      <div className="font-medium text-white">{d.type}</div>
                      <div className="text-[11px] text-textmut">{d.confidence ? `${d.confidence}% · ` : ''}{d.time}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-textmut">No active detections in this zone.</p>
              )}
            </div>
          </div>
        )
      })()}

      {/* ── Legend ── */}
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 rounded-xl border border-white/10 bg-black/65 px-3 py-2 text-xs text-white shadow-lg backdrop-blur-sm">
        {[
          { label: 'High Risk',  color: '#ff5a4d' },
          { label: 'Moderate',   color: '#ffb020' },
          { label: 'Monitored',  color: '#12b5b0' },
        ].map(({ label, color }) => (
          <span key={label} className="flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full" style={{ background: color }}/>
            {label}
          </span>
        ))}
      </div>

      {/* ── Real-time Sun Lighting Slider ── */}
      <div className="absolute right-3 bottom-3 z-30 flex items-center gap-2 rounded-xl border border-white/10 bg-black/65 px-2.5 py-1.5 text-[10px] text-white shadow-lg backdrop-blur-sm">
        <span className="text-textmut font-bold uppercase tracking-wider">Sun Pos</span>
        <input
          type="range"
          min="0"
          max="360"
          value={lightAngle}
          onChange={(e) => setLightAngle(Number(e.target.value))}
          className="w-16 accent-teal cursor-pointer"
        />
        <span className="font-mono text-teallite">{lightAngle}°</span>
      </div>

      {/* ── Scan badge ── */}
      <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-black/55 px-2.5 py-1 text-[10px] text-cyan-300 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400"/>
        Drone patrol active
      </div>
    </div>
  )
}
