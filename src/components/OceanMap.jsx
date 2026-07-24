import { useEffect, useRef } from 'react'
import { zones as allZones, oceanHealthIndex } from '../data/mockData.js'

const riskColor = { high: '#ff5a4d', moderate: '#ffb020', low: '#12b5b0' }

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

// Ridged multifractal — sharp mountain crests for rugged highlands.
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
//  NOAA Bathymetric Color Ramp (Vibrant Cobalt -> Turquoise -> Neon Lime)
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
//  Geologically Realistic Terrain Generation (Continental Slope + Scarp + Gullies)
// ─────────────────────────────────────────────────────────────────────────────
function renderTerrain(canvas) {
  const W = canvas.width
  const H = canvas.height

  const hmap = new Float32Array(W * H)
  let hMin =  Infinity, hMax = -Infinity

  for (let y = 0; y < H; y++) {
    const ny = y / H
    for (let x = 0; x < W; x++) {
      const nx = x / W

      // Scaled sample coords (larger features)
      const sx = nx * 3.2, sy = ny * 3.2

      // ── Domain warping (organic, VARIED large-scale terrain — basins & highlands) ──
      const qx = fbm(sx, sy, 3), qy = fbm(sx + 5.2, sy + 1.3, 3)
      const rx = fbm(sx + 4 * qx + 1.7, sy + 4 * qy + 9.2, 3)
      const ry = fbm(sx + 4 * qx + 8.3, sy + 4 * qy + 2.8, 3)
      const big = fbm(sx + 4 * rx, sy + 4 * ry, 4)
      const elev = Math.pow(Math.max(0, big), 1.35)         // deepen basins, sharpen highs

      // ── Rugged mountain ranges only on highlands (warped ridged noise) ──
      let m = Math.max(0, Math.min(1, (big - 0.42) / 0.28))
      const mtnMask = m * m * (3 - 2 * m)
      const ridges = (rfbm(sx * 2.4 + rx * 3, sy * 2.4 + ry * 3, 5) - 0.35) * 0.55 * mtnMask

      // ── A deep curved trench gouge ──
      const trenchX = 0.30 + 0.12 * Math.sin(ny * Math.PI * 1.4)
      const dist = Math.abs(nx - trenchX)
      const trench = -0.22 * Math.exp(-Math.pow(dist / 0.045, 2))

      // ── Fine rocky detail ──
      const fine = (fbm(sx * 7.5, sy * 7.5, 3) - 0.5) * 0.06

      // Combine layers
      const h = elev * 0.85 + ridges + trench + fine

      hmap[y * W + x] = h
      if (h < hMin) hMin = h
      if (h > hMax) hMax = h
    }
  }

  // ── Hillshading Pass ──
  const hRange = hMax - hMin
  const ctx    = canvas.getContext('2d')
  const img    = ctx.createImageData(W, H)
  const d      = img.data

  // Grazing light direction from upper-right
  const lx =  0.60, ly = -0.66, lz = 0.50
  const lLen = Math.sqrt(lx*lx + ly*ly + lz*lz)

  // Half-vector for Blinn-Phong specular glint
  const hvx = lx/lLen, hvy = ly/lLen, hvz = lz/lLen + 1.0
  const hvLen = Math.sqrt(hvx*hvx + hvy*hvy + hvz*hvz)

  const surfScale = 16.0 / hRange

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const h = (hmap[y * W + x] - hMin) / hRange

      const hL = hmap[y * W +          Math.max(0,   x - 1)]
      const hR = hmap[y * W +          Math.min(W-1, x + 1)]
      const hU = hmap[Math.max(0,   y-1) * W + x]
      const hD = hmap[Math.min(H-1, y+1) * W + x]

      const nxn = -(hR - hL) * surfScale
      const nyn = -(hD - hU) * surfScale
      const nzn =  1.0
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

      // Bright ambient keeps deep water luminous, ridges still shadowed
      const shade = 0.42 + diff * 0.66

      let r = r0 * shade + spec * 90
      let g = g0 * shade + spec * 110
      let b = b0 * shade + spec * 150

      // Light vignette
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
//  Component
// ─────────────────────────────────────────────────────────────────────────────
export default function OceanMap({ zones = allZones, height = 420, showHeat = true }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const id = setTimeout(() => renderTerrain(canvas), 20)
    return () => clearTimeout(id)
  }, [])

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
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

      {/* ── SVG overlays (Highly matching the path lines in the reference image) ── */}
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

        {/* ── Path A (Traces the "Sudden" Fault Scarp - smooth clean line) ── */}
        {/* Bloom */}
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
        {/* Sharp core */}
        <path
          className="sc1"
          d="M 230 130 L 580 540"
          fill="none"
          stroke="#d2e5ff"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.95"
        />

        {/* ── Path B (Traces the "Normal" scalloped ridge erosion path with a hook at the top) ── */}
        {/* Bloom */}
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
        {/* Sharp core */}
        <path
          className="sc2"
          d="M 350 50 Q 280 50, 290 85 T 350 100 Q 425 100, 425 160 Q 425 200, 455 220 Q 495 220, 495 285 Q 495 325, 545 345 Q 615 345, 615 405 Q 615 445, 665 465 Q 725 465, 735 520"
          fill="none"
          stroke="#e0faff"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.9"
        />
      </svg>

      {/* ── Heat blobs ── */}
      {showHeat && zones.map((z) => (
        <span
          key={`heat-${z.id}`}
          className="pointer-events-none absolute rounded-full"
          style={{
            left: `${z.x}%`, top: `${z.y}%`,
            width: 170, height: 170,
            transform: 'translate(-50%,-50%)',
            background: `radial-gradient(circle,${riskColor[z.risk]}80 0%,${riskColor[z.risk]}28 42%,transparent 68%)`,
          }}
        />
      ))}

      {/* ── Zone markers + hover tooltips ── */}
      {zones.map((z) => (
        <div
          key={z.id}
          className="group absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${z.x}%`, top: `${z.y}%` }}
        >
          <span
            className="absolute -inset-2 animate-ping rounded-full opacity-25"
            style={{ background: riskColor[z.risk] }}
          />
          <span
            className="relative block h-3.5 w-3.5 rounded-full"
            style={{
              background: riskColor[z.risk],
              boxShadow: `0 0 10px 4px ${riskColor[z.risk]}70, 0 0 0 2px #ffffff22`,
            }}
          />
          <div className="pointer-events-none absolute left-1/2 top-5 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/15 bg-ink2/95 px-3 py-2 text-xs text-white shadow-xl backdrop-blur-sm group-hover:block">
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-ink2/95"/>
            <div className="font-semibold">{z.name}</div>
            <div className="mt-0.5 text-textmut">
              Health {oceanHealthIndex(z)} ·{' '}
              <span style={{ color: riskColor[z.risk] }}>{z.risk} risk</span>
            </div>
          </div>
        </div>
      ))}

      {/* ── Legend ── */}
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 rounded-xl border border-white/10 bg-black/65 px-3 py-2 text-xs text-white shadow-lg backdrop-blur-sm">
        {[
          { label: 'High',      color: '#ff5a4d' },
          { label: 'Moderate',  color: '#ffb020' },
          { label: 'Monitored', color: '#12b5b0' },
        ].map(({ label, color }) => (
          <span key={label} className="flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full" style={{ background: color }}/>
            {label}
          </span>
        ))}
      </div>

      {/* ── Scan badge ── */}
      <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-black/55 px-2.5 py-1 text-[10px] text-cyan-300 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400"/>
        Drone survey active
      </div>
    </div>
  )
}
