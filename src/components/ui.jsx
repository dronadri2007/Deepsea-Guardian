// Small shared UI primitives used across pages.

export function Container({ className = '', children }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 ${className}`}>{children}</div>
}

export function SectionHeading({ eyebrow, title, subtitle, center, dark }) {
  return (
    <div className={`${center ? 'text-center mx-auto max-w-2xl' : 'max-w-3xl'} mb-8`}>
      {eyebrow && (
        <p className={`text-sm font-semibold uppercase tracking-wide ${dark ? 'text-teallite' : 'text-tealink'}`}>
          {eyebrow}
        </p>
      )}
      <h2 className={`mt-2 font-head text-2xl font-bold sm:text-3xl ${dark ? 'text-white' : 'text-ink'}`}>
        {title}
      </h2>
      {subtitle && <p className={`mt-3 ${dark ? 'text-textmut' : 'text-textd/70'}`}>{subtitle}</p>}
    </div>
  )
}

const toneMap = {
  critical: 'bg-alert/15 text-alert',
  high: 'bg-alert/15 text-alert',
  warning: 'bg-warn/20 text-[#9a6400]',
  moderate: 'bg-warn/20 text-[#9a6400]',
  medium: 'bg-warn/20 text-[#9a6400]',
  info: 'bg-teal/15 text-tealink',
  low: 'bg-teal/15 text-tealink',
  good: 'bg-health/15 text-[#137a45]',
}

export function Badge({ tone = 'info', children }) {
  const cls = toneMap[String(tone).toLowerCase()] || 'bg-teal/15 text-tealink'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {children}
    </span>
  )
}
