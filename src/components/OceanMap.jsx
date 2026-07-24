import { zones as allZones, oceanHealthIndex } from '../data/mockData.js'

const riskColor = { high: '#ff5a4d', moderate: '#ffb020', low: '#12b5b0' }

/**
 * OceanMap — NOAA-style bathymetric sonar render.
 *
 * Visual layers (bottom → top):
 *   1. Diagonal depth gradient (royal-blue deep → neon-green shallow)
 *   2. SVG filter: feTurbulence noise → feDiffuseLighting (3-D terrain shading)
 *                  + feSpecularLighting (ridge peak highlights)
 *                  + feDisplacementMap (terrain warp)
 *   3. Diagonal glowing cyan scan-path lines (drone survey tracks)
 *   4. Radial heat blobs (existing)
 *   5. Zone markers + hover tooltips (existing)
 *   6. Legend (existing)
 *
 * No libraries, no raster images. Lighthouse-safe.
 */
export default function OceanMap({ zones = allZones, height = 420, showHeat = true }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{ height, background: '#060f52' }}
      role="img"
      aria-label="Bathymetric sonar map of monitored deep-sea zones with predictive risk heatmap and drone survey tracks"
    >
      {/* ── SVG terrain: full-bleed, no pointer events ─────────────── */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          {/* ── Depth gradient: royal-blue (deep/bottom-left) → lime (shallow/top-right) ── */}
          <linearGradient id="bathyGrad" x1="5%" y1="95%" x2="90%" y2="5%">
            <stop offset="0%"   stopColor="#0512a8" />   {/* abyssal blue        */}
            <stop offset="12%"  stopColor="#0e22cc" />   {/* deep royal blue     */}
            <stop offset="28%"  stopColor="#1040d8" />   {/* cobalt              */}
            <stop offset="44%"  stopColor="#0e6abf" />   {/* transitional blue   */}
            <stop offset="58%"  stopColor="#0aa8c0" />   {/* cyan                */}
            <stop offset="72%"  stopColor="#12c890" />   {/* teal-green          */}
            <stop offset="85%"  stopColor="#38e858" />   {/* bright green        */}
            <stop offset="100%" stopColor="#80ff28" />   {/* neon lime           */}
          </linearGradient>

          {/* ── Main terrain filter ── */}
          {/*
              Chain:
                1a. feTurbulence (high-freq, detail)  → fine ridge bumps
                1b. feTurbulence (low-freq, envelope) → large-scale amplitude map
                1c. feComposite arithmetic × detail×envelope → uneven crest heights
                    (where envelope is low → ridges flatten; where high → peaks surge)
                2.  feDiffuseLighting  → 3-D shading from upper-right
                3.  feSpecularLighting → bright cyan ridge-peak highlights
                1d. feTurbulence (warp) → separate displacement source
                4.  feDisplacementMap  → warp gradient with noise
                5.  feBlend multiply   → burn lighting onto terrain
                6.  feBlend screen     → add specular
                7.  feComposite in     → clip overflow
          */}
          <filter
            id="bathyRelief"
            x="-8%" y="-8%" width="116%" height="116%"
            colorInterpolationFilters="sRGB"
          >
            {/* 1a — high-frequency fractal detail: fine ridge texture */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.022 0.008"
              numOctaves="8"
              seed="17"
              stitchTiles="stitch"
              result="detailNoise"
            />

            {/* 1b — low-frequency envelope: controls WHERE ridges are prominent */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.005 0.003"
              numOctaves="3"
              seed="33"
              result="envelope"
            />

            {/*
                1c — multiply detail × envelope (arithmetic: k1·a·b + k2·a + k3·b + k4)
                     k1=2.4 amplifies the product → tall ridges where both are high,
                     flat seafloor where envelope dips — this is what makes crests uneven.
            */}
            <feComposite
              in="detailNoise"
              in2="envelope"
              operator="arithmetic"
              k1="2.4" k2="0" k3="0" k4="0"
              result="bumpMap"
            />

            {/* 1d — separate turbulence for displacement warping of the gradient */}
            <feTurbulence
              type="turbulence"
              baseFrequency="0.020 0.008"
              numOctaves="6"
              seed="17"
              stitchTiles="stitch"
              result="dispNoise"
            />

            {/* 2 — diffuse lighting from upper-right, low elevation = dramatic valley shadows */}
            <feDiffuseLighting
              in="bumpMap"
              lightingColor="#ffffff"
              diffuseConstant="2.5"
              surfaceScale="8"
              result="diffuse"
            >
              <feDistantLight azimuth="310" elevation="19" />
            </feDiffuseLighting>

            {/* 3 — specular highlights on crest peaks */}
            <feSpecularLighting
              in="bumpMap"
              lightingColor="#8af0ff"
              specularConstant="2.2"
              specularExponent="38"
              surfaceScale="8"
              result="specular"
            >
              <feDistantLight azimuth="310" elevation="19" />
            </feSpecularLighting>

            {/* 4 — warp the depth-gradient rect through the displacement field */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="dispNoise"
              scale="78"
              xChannelSelector="R"
              yChannelSelector="G"
              result="warped"
            />

            {/* 5 — burn diffuse lighting onto warped terrain */}
            <feBlend in="warped" in2="diffuse" mode="multiply" result="terrain" />

            {/* 6 — add specular ridge highlights */}
            <feBlend in="terrain" in2="specular" mode="screen" result="lit" />

            {/* 7 — clip displacement overflow back to original shape */}
            <feComposite in="lit" in2="SourceGraphic" operator="in" />
          </filter>

          {/* ── Scan-line glow filter ── */}
          <filter id="scanGlow" x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="9"   result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* ── Scan-path animation ── */}
          <style>{`
            @keyframes scanA {
              from { stroke-dashoffset: 1100; }
              to   { stroke-dashoffset: 0; }
            }
            @keyframes scanB {
              from { stroke-dashoffset: 950; }
              to   { stroke-dashoffset: 0; }
            }
            .sA { stroke-dasharray: 1100; animation: scanA 11s linear infinite; }
            .sB { stroke-dasharray:  950; animation: scanB 14s linear infinite 2.5s; }
            @media (prefers-reduced-motion: reduce) {
              .sA, .sB { animation: none; stroke-dashoffset: 0; }
            }
          `}</style>
        </defs>

        {/* ── Layer 1 + 2: Terrain gradient + 3-D relief filter ── */}
        {/* Rect extends beyond viewBox so displacement doesn't expose edges */}
        <rect
          x="-100" y="-100"
          width="1200" height="800"
          fill="url(#bathyGrad)"
          filter="url(#bathyRelief)"
        />

        {/* ── Layer 3: Edge vignette — keeps frame dark ── */}
        <defs>
          <radialGradient id="vig" cx="50%" cy="50%" r="72%">
            <stop offset="0%"   stopColor="#000" stopOpacity="0"    />
            <stop offset="100%" stopColor="#000" stopOpacity="0.52" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="1000" height="600" fill="url(#vig)" />

        {/* ── Layer 4: Diagonal scan-path lines ── */}
        {/*
            Two diagonal survey tracks matching the ridge direction (≈ 38°).
            Each rendered twice: glowing bloom layer + sharp bright core line.
        */}

        {/* Track A — primary (upper) sweep */}
        {/* Bloom */}
        <line
          className="sA"
          x1="-60"  y1="460"
          x2="880"  y2="-30"
          stroke="#00e5ff"
          strokeWidth="5"
          strokeLinecap="round"
          filter="url(#scanGlow)"
          opacity="0.75"
        />
        {/* Core */}
        <line
          className="sA"
          x1="-60"  y1="460"
          x2="880"  y2="-30"
          stroke="#b8f8ff"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Track B — secondary (lower) sweep */}
        {/* Bloom */}
        <line
          className="sB"
          x1="-60"  y1="620"
          x2="1060" y2="80"
          stroke="#00e5ff"
          strokeWidth="4"
          strokeLinecap="round"
          filter="url(#scanGlow)"
          opacity="0.60"
        />
        {/* Core */}
        <line
          className="sB"
          x1="-60"  y1="620"
          x2="1060" y2="80"
          stroke="#b8f8ff"
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity="0.80"
        />
      </svg>

      {/* ── Heat blobs (existing — zone risk radial glow) ─────────── */}
      {showHeat &&
        zones.map((z) => (
          <span
            key={`heat-${z.id}`}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: `${z.x}%`,
              top:  `${z.y}%`,
              width:  170,
              height: 170,
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, ${riskColor[z.risk]}80 0%, ${riskColor[z.risk]}28 42%, transparent 68%)`,
            }}
          />
        ))}

      {/* ── Zone markers + hover tooltips (existing) ─────────────── */}
      {zones.map((z) => (
        <div
          key={z.id}
          className="group absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${z.x}%`, top: `${z.y}%` }}
        >
          {/* Pulse ring */}
          <span
            className="absolute -inset-2 animate-ping rounded-full opacity-25"
            style={{ background: riskColor[z.risk] }}
          />
          {/* Dot */}
          <span
            className="relative block h-3.5 w-3.5 rounded-full"
            style={{
              background: riskColor[z.risk],
              boxShadow: `0 0 10px 4px ${riskColor[z.risk]}70, 0 0 0 2px #ffffff22`,
            }}
          />
          {/* Tooltip */}
          <div className="pointer-events-none absolute left-1/2 top-5 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/15 bg-ink2/95 px-3 py-2 text-xs text-white shadow-xl backdrop-blur-sm group-hover:block">
            {/* Caret */}
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-ink2/95" />
            <div className="font-semibold">{z.name}</div>
            <div className="mt-0.5 text-textmut">
              Health {oceanHealthIndex(z)} ·{' '}
              <span style={{ color: riskColor[z.risk] }}>{z.risk} risk</span>
            </div>
          </div>
        </div>
      ))}

      {/* ── Legend (existing) ─────────────────────────────────────── */}
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs text-white shadow-lg backdrop-blur-sm">
        {[
          { label: 'High',      color: '#ff5a4d' },
          { label: 'Moderate',  color: '#ffb020' },
          { label: 'Monitored', color: '#12b5b0' },
        ].map(({ label, color }) => (
          <span key={label} className="flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>

      {/* ── Scan-track badge ─────────────────────────────────────── */}
      <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-black/55 px-2.5 py-1 text-[10px] text-cyan-300 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
        Drone survey active
      </div>
    </div>
  )
}
