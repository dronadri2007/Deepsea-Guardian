// Small shared UI primitives used across pages.

export function Container({ className = '', children }) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`}>
      {children}
    </div>
  )
}

export function SectionHeading({ eyebrow, title, subtitle, center, dark }) {
  return (
    <div className={`${center ? 'text-center mx-auto max-w-2xl' : 'max-w-3xl'} mb-10`}>
      {eyebrow && (
        <p className={`text-xs font-semibold uppercase tracking-widest ${dark ? 'text-teallite' : 'text-tealink'}`}>
          {eyebrow}
        </p>
      )}
      <h2 className={`mt-2 font-head text-2xl font-bold sm:text-3xl ${dark ? 'text-white' : 'text-ink'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-3 leading-relaxed ${dark ? 'text-textmut' : 'text-textd/70'}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

const toneMap = {
  critical:  'bg-alert/15 text-alert ring-1 ring-alert/20',
  high:      'bg-alert/15 text-alert ring-1 ring-alert/20',
  warning:   'bg-warn/20 text-[#9a6400] ring-1 ring-warn/25',
  moderate:  'bg-warn/20 text-[#9a6400] ring-1 ring-warn/25',
  medium:    'bg-warn/20 text-[#9a6400] ring-1 ring-warn/25',
  info:      'bg-teal/15 text-tealink ring-1 ring-teal/20',
  low:       'bg-teal/15 text-tealink ring-1 ring-teal/20',
  good:      'bg-health/15 text-[#137a45] ring-1 ring-health/20',
}

export function Badge({ tone = 'info', children }) {
  const cls = toneMap[String(tone).toLowerCase()] || 'bg-teal/15 text-tealink ring-1 ring-teal/20'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {children}
    </span>
  )
}
