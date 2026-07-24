import { healthBand } from '../data/mockData.js'

// SVG semicircle gauge for the Ocean Health Index (0–100).
export default function OceanHealthGauge({ score = 0, size = 220, label = true }) {
  const clamped = Math.max(0, Math.min(100, score))
  const band = healthBand(clamped)

  const r = 80
  const cx = 100
  const cy = 100
  const circumference = Math.PI * r // half circle
  const offset = circumference * (1 - clamped / 100)

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 200 118"
        width={size}
        height={size * 0.59}
        role="img"
        aria-label={`Ocean Health Index ${clamped} out of 100, ${band.label}`}
      >
        {/* track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="#1d3d5c"
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* value */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke={band.color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.9s ease, stroke 0.4s ease' }}
        />
        <text x="100" y="92" textAnchor="middle" className="fill-white font-head" style={{ fontSize: 40, fontWeight: 700 }}>
          {clamped}
        </text>
      </svg>
      {label && (
        <div className="-mt-1 text-center">
          <span className="text-sm text-textmut">/ 100 · </span>
          <span className="text-sm font-semibold" style={{ color: band.color }}>{band.label}</span>
        </div>
      )}
    </div>
  )
}
