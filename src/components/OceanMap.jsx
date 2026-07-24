import { useEffect, useRef } from 'react'
import { zones as allZones, oceanHealthIndex } from '../data/mockData.js'

const riskColor = { high: '#ff5a4d', moderate: '#ffb020', low: '#12b5b0' }

// ─────────────────────────────────────────────────────────────────────────────
//  Noise helpers — no external library, pure math
// ─────────────────────────────────────────────────────────────────────────────

/** Deterministic pseudo-random float ∈ [0,1] from two integers */
function hash(ix, iy) {
  const n = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453
  return n - Math.floor(n)
}

/** Bilinear value noise — smooth C1 interpolation via smoothstep */
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

/**
 * Fractal Brownian Motion — layered octaves of value noise.
 * Creates the organic, rocky surface texture real seafloor has.
 * lacunarity 2.1 (slightly irrational) avoids grid artefacts.
 */
function fbm(x, y, octaves = 4) {
  let v = 0, a = 0.5, f = 1
  for (let i = 0; i < octaves; i++) {
    v += vnoise(x * f, y * f) * a
    a *= 0.5
    f *= 2.1
  }
  return v   // ≈ [0, 1]
}

// ─────────────────────────────────────────────────────────────────────────────
//  NOAA colour ramp — vivid cobalt blue → teal → neon lime
//  (matched directly from the reference bathymetric screenshot)
// ─────────────────────────────────────────────────────────────────────────────
function bathyRGB(t) {
  const stops = [
    [0.00, [  6,  22, 168]],   // deep cobalt-royal blue
    [0.14, [ 10,  38, 200]],   // bright royal blue
    [0.27, [ 14,  68, 215]],   // medium cobalt
    [0.40, [ 12, 120, 205]],   // cyan-blue
    [0.52, [  8, 168, 182]],   // cyan-teal
    [0.64, [ 10, 200, 148]],   // teal
    [0.76, [ 28, 222,  95]],   // teal-green
    [0.88, [ 72, 240,  48]],   // bright green
    [1.00, [145, 255,  22]],   // neon lime
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
//  Terrain renderer — two-pass (heightmap → hillshade)
// ─────────────────────────────────────────────────────────────────────────────
function renderTerrain(canvas) {
  const W = canvas.width
  const H = canvas.height

  // Ridge system runs at ~33° — matches diagonal in reference image
  const ang  = (33 * Math.PI) / 180
  const cosA = Math.cos(ang)
  const sinA = Math.sin(ang)

  // ── Pass 1: heightmap ────────────────────────────────────────────────
  const hmap = new Float32Array(W * H)
  let hMin =  Infinity, hMax = -Infinity

  for (let y = 0; y < H; y++) {
    const ny = y / H
    for (let x = 0; x < W; x++) {
      const nx = x / W

      // Rotated coordinates aligned with ridge direction
      const along =  nx * cosA + ny * sinA   // ∥ crest
      const perp  = -nx * sinA + ny * cosA   // ⊥ crest (drives ridge shape)

      // ── 1. Large-scale depth gradient ─────────────────────────────────
      // Deep ocean bottom-left (blue), shallow shelf top-right (green)
      const base = nx * 0.48 + (1 - ny) * 0.20

      // ── 2. Structured ridge sine waves (⊥ direction) ──────────────────
      // Multiple harmonics: primary ridge + sub-ridges + fine corrugations
      let ridge = 0
      ridge += 0.42 * Math.sin(perp * Math.PI * 4.6)
      ridge += 0.26 * Math.sin(perp * Math.PI * 9.5  + 0.82)
      ridge += 0.16 * Math.sin(perp * Math.PI * 17.0 + 1.68)
      ridge += 0.10 * Math.sin(perp * Math.PI * 28.5 + 2.55)
      ridge += 0.06 * Math.sin(perp * Math.PI * 47.0 + 1.12)

      // ── 3. FBM noise — organic surface roughness ──────────────────────
      // This is what makes the ridges look rocky, not mathematical.
      // ns=6.5 → feature size ≈ 1/6.5 of the map (medium boulders/rock faces).
      const ns   = 6.5
      const surf = fbm(nx * ns, ny * ns, 4) - 0.5   // centred ∈ [–0.5, +0.5]

      // ── 4. Amplitude modulation along ridge ───────────────────────────
      // Multiple sine terms along the ∥ direction create sections where
      // ridges tower (terms add) or flatten to abyssal plains (terms cancel).
      const amp = Math.max(0.08,
        0.55
        + 0.34 * Math.sin(along * Math.PI *  3.6 + 0.42)
        + 0.24 * Math.sin(along * Math.PI *  7.2 + 2.05)
        + 0.15 * Math.sin(along * Math.PI * 13.4 + 0.88)
        + 0.09 * Math.sin(along * Math.PI * 22.8 + 3.50)
        + 0.05 * Math.sin(along * Math.PI * 38.0 + 1.70)
      )

      // Final height: depth gradient + (modulated ridges) + noise texture
      const h = base + ridge * amp * 0.32 + surf * 0.19

      hmap[y * W + x] = h
      if (h < hMin) hMin = h
      if (h > hMax) hMax = h
    }
  }

  // ── Pass 2: hillshade + paint ────────────────────────────────────────
  const hRange = hMax - hMin
  const ctx    = canvas.getContext('2d')
  const img    = ctx.createImageData(W, H)
  const d      = img.data

  // Grazing light from upper-right — low elevation = long shadows, high drama
  const lx =  0.58, ly = -0.66, lz = 0.48
  const lLen = Math.sqrt(lx*lx + ly*ly + lz*lz)

  // Blinn-Phong half-vector (viewer straight above: [0,0,1])
  const hvx = lx/lLen, hvy = ly/lLen, hvz = lz/lLen + 1
  const hvLen = Math.sqrt(hvx*hvx + hvy*hvy + hvz*hvz)

  // surfScale: amplifies normal from height gradient → higher = steeper perceived relief
  const surfScale = 9.0 / hRange

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const h = (hmap[y * W + x] - hMin) / hRange   // normalised [0,1]

      // ── Surface normal via finite differences ──────────────────────────
      const hL = hmap[y * W +          Math.max(0,   x - 1)]
      const hR = hmap[y * W +          Math.min(W-1, x + 1)]
      const hU = hmap[Math.max(0,   y-1) * W + x]
      const hD = hmap[Math.min(H-1, y+1) * W + x]

      const nxn = -(hR - hL) * surfScale
      const nyn = -(hD - hU) * surfScale
      const nzn =  1.0
      const nLen = Math.sqrt(nxn*nxn + nyn*nyn + nzn*nzn)

      // ── Lambertian diffuse ────────────────────────────────────────────
      const diff = Math.max(0,
        nxn/nLen * lx/lLen +
        nyn/nLen * ly/lLen +
        nzn/nLen * lz/lLen
      )

      // ── Blinn-Phong specular ──────────────────────────────────────────
      const spec = Math.pow(Math.max(0,
        nxn/nLen * hvx/hvLen +
        nyn/nLen * hvy/hvLen +
        nzn/nLen * hvz/hvLen
      ), 42)

      // ── Base colour from ramp ─────────────────────────────────────────
      const [r0, g0, b0] = bathyRGB(h)

      // Low ambient → very dark valleys; high diffuse → bright lit faces
      const shade = 0.07 + diff * 0.93

      // Specular: cyan-white peaks (matches the bright ridge highlights in reference)
      let r = r0 * shade + spec * 180
      let g = g0 * shade + spec * 230
      let b = b0 * shade + spec * 255

      // ── Radial vignette ───────────────────────────────────────────────
      const vdx = (x / W - 0.5) * 2
      const vdy = (y / H - 0.5) * 2
      const vig = 1 - Math.max(0, Math.sqrt(vdx*vdx + vdy*vdy) * 0.48 - 0.04) * 0.60

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
      style={{ height, background: '#060f8a' }}
      role="img"
      aria-label="Bathymetric sonar map of monitored deep-sea zones with predictive risk heatmap and drone survey tracks"
    >
      {/* ── Canvas terrain ─────────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        width={720}
        height={432}
        className="absolute inset-0 h-full w-full"
        style={{ imageRendering: 'auto' }}
        aria-hidden="true"
      />

      {/* ── SVG: animated glowing drone scan paths ─────────────────────── */}
      <svg
        className="absolute inset-0 h-full w-full pointer-events-none"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter id="sg" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5"  result="b1"/>
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="b2"/>
            <feMerge>
              <feMergeNode in="b2"/>
              <feMergeNode in="b1"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <style>{`
            @keyframes sd1{from{stroke-dashoffset:1150}to{stroke-dashoffset:0}}
            @keyframes sd2{from{stroke-dashoffset:980}to{stroke-dashoffset:0}}
            .sc1{stroke-dasharray:1150;animation:sd1 12s linear infinite}
            .sc2{stroke-dasharray:980;animation:sd2 16s linear infinite 3s}
            @media(prefers-reduced-motion:reduce){.sc1,.sc2{animation:none;stroke-dashoffset:0}}
          `}</style>
        </defs>

        {/* Track A */}
        <line className="sc1" x1="-80" y1="500" x2="940"  y2="-50"
          stroke="#00e5ff" strokeWidth="6" strokeLinecap="round"
          filter="url(#sg)" opacity="0.78"/>
        <line className="sc1" x1="-80" y1="500" x2="940"  y2="-50"
          stroke="#ccf8ff" strokeWidth="1.4" strokeLinecap="round" opacity="0.95"/>

        {/* Track B */}
        <line className="sc2" x1="-80" y1="670" x2="1100" y2="120"
          stroke="#00e5ff" strokeWidth="4.5" strokeLinecap="round"
          filter="url(#sg)" opacity="0.62"/>
        <line className="sc2" x1="-80" y1="670" x2="1100" y2="120"
          stroke="#ccf8ff" strokeWidth="1.1" strokeLinecap="round" opacity="0.85"/>
      </svg>

      {/* ── Heat blobs ─────────────────────────────────────────────────── */}
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

      {/* ── Zone markers + hover tooltips ──────────────────────────────── */}
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

      {/* ── Legend ─────────────────────────────────────────────────────── */}
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

      {/* ── Scan badge ─────────────────────────────────────────────────── */}
      <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-black/55 px-2.5 py-1 text-[10px] text-cyan-300 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400"/>
        Drone survey active
      </div>
    </div>
  )
}
