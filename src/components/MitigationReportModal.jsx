import { useEffect, useState } from 'react'
import { Printer, X, Shield, Cpu, Calendar, Compass, AlertCircle } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

export default function MitigationReportModal() {
  const { activeReport, setActiveReport, triggerSound } = useApp()
  const [typedText, setTypedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleClose = () => {
    setActiveReport(null)
    triggerSound('click')
  }

  // Pre-generate report content based on metrics
  const getReportContent = () => {
    if (!activeReport) return ''

    const { name, id, type, metrics } = activeReport
    const zoneId = metrics?.zone || metrics?.id || 'C-4'

    if (type === 'zone') {
      const plastic = metrics?.plastic ?? 0
      const bleaching = metrics?.bleaching ?? 0
      const nets = metrics?.nets ?? 0
      const score = metrics?.score ?? 100

      let text = `AI TELEMETRY TELECONFERENCE — MONITORED ZONE REPORT [${id}]\n`
      text += `---------------------------------------------------------\n\n`
      text += `ANALYSIS SUMMARY:\n`
      text += `Zone ${name} is performing at an Ocean Health Index of ${score}/100. `

      if (score < 40) {
        text += `CRITICAL HAZARD RATING. Immediate eco-defense deployment recommended.\n\n`
      } else if (score < 70) {
        text += `MODERATE HAZARD RATING. Standard drone surveys intensified.\n\n`
      } else {
        text += `HEALTHY STANDARDS CONFIRMED. Baseline monitoring active.\n\n`
      }

      text += `ACTIVE TELEMETRY LOAD:\n`
      text += `- Plastic level: ${plastic}/3 (${plastic === 3 ? 'Critical accumulation' : plastic === 2 ? 'Moderate' : 'Trace'})\n`
      text += `- Bleaching level: ${bleaching}/3 (${bleaching === 3 ? 'Thermal bleaching onset' : bleaching === 2 ? 'High risk' : 'Nominal'})\n`
      text += `- Ghost fishing gear: ${nets} clusters detected.\n\n`

      text += `DEPLOYMENT MITIGATION DIRECTIVE:\n`
      if (plastic >= 2 || nets >= 2) {
        text += `1. DISPATCH drone fleet for mechanical netting capture and extraction.\n`
        text += `2. FLAG satellite imaging channels to scan for local vessel movements.\n`
      }
      if (bleaching >= 2) {
        text += `3. ENGAGE thermal sensors to track deep-sea upwelling cooling loops.\n`
      }
      text += `4. LOG telemetry logs to national ecological data register.`
      return text
    } else {
      // Alert type
      const severity = metrics?.severity || 'High'
      const status = metrics?.status || 'Open'
      const raised = metrics?.raised || 'Recently'

      let text = `ECO-RESPONSE EMERGENCY DIRECTIVE — PROTOCOL ID [${id}]\n`
      text += `---------------------------------------------------------\n\n`
      text += `REPORT DATA:\n`
      text += `- Event Profile: ${name}\n`
      text += `- Target Grid Sector: Zone ${metrics?.zone || 'C-4'}\n`
      text += `- Severity Threshold: ${severity}\n`
      text += `- Lifecycle Status: ${status}\n`
      text += `- Initial Incident Registry: ${raised}\n\n`

      text += `AI MITIGATION STRATEGY:\n`
      if (severity === 'Critical') {
        text += `[ALERT LEVEL RED] CRITICAL HAZARD INTERCEPT ACTIVATED.\n`
        text += `- Dispatch autonomous underwater drones to grid sector.\n`
        text += `- Transmit coordinates to local coast guard for maritime interception.\n`
        text += `- Initiate floating containment barriers if oil or chemical spill spreads.`
      } else if (severity === 'High') {
        text += `[ALERT LEVEL AMBER] ENHANCED SURVEY DISPATCHED.\n`
        text += `- Pivot nearest sonar node scanning frequency to 10s intervals.\n`
        text += `- Queue robotic debris recovery sequence.\n`
        text += `- Update incident log status to Investigating.`
      } else {
        text += `[ALERT LEVEL GREEN] BASELINE PROTOCOL ENFORCED.\n`
        text += `- Logging details to registry.\n`
        text += `- Drone patrol routes automatically mapped to cover sector coordinates.`
      }
      return text
    }
  }

  // Typewriter effect on open
  useEffect(() => {
    if (!activeReport) {
      setTypedText('')
      return
    }

    const text = getReportContent()
    setTypedText('')
    setIsTyping(true)

    let charIdx = 0
    const interval = setInterval(() => {
      setTypedText((prev) => prev + text.charAt(charIdx))
      charIdx++
      if (charIdx >= text.length) {
        clearInterval(interval)
        setIsTyping(false)
      }
    }, 12)

    return () => clearInterval(interval)
  }, [activeReport])

  if (!activeReport) return null

  const handlePrint = () => {
    triggerSound('success')
    window.print()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm no-print"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-teal/20 bg-panel text-white shadow-2xl modal-print-layout">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-borderd bg-ink/40 px-6 py-4 no-print">
          <div className="flex items-center gap-2 text-teal">
            <Shield className="h-5 w-5 animate-pulse" />
            <span className="font-head text-sm font-bold uppercase tracking-wider">AI Mitigation System</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-textmut hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Report Content */}
        <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto font-mono text-xs leading-relaxed bg-[#0b1726]">
          {/* Printable Report Header */}
          <div className="hidden print-only mb-6 border-b-2 border-black pb-4 text-black text-center">
            <h1 className="text-xl font-bold font-head uppercase tracking-wide">DeepSea Guardian Ecological Defense</h1>
            <p className="text-[10px] mt-1 font-semibold uppercase tracking-widest text-gray-600">Unified Maritime Command telecommunications registry</p>
          </div>

          {/* Styled telemetry data cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6 border-b border-borderd/40 pb-6 text-black print:text-black">
            <div className="rounded-xl bg-panel/40 border border-borderd/30 p-3 text-white print:text-black print:bg-gray-100 print:border-gray-300">
              <div className="flex items-center gap-1.5 text-textmut print:text-gray-500 font-bold uppercase tracking-widest text-[9px] mb-1">
                <Compass className="h-3 w-3" /> Grid Sector
              </div>
              <div className="font-bold text-sm">Zone {activeReport.metrics?.zone || activeReport.metrics?.id || 'C-4'}</div>
            </div>
            <div className="rounded-xl bg-panel/40 border border-borderd/30 p-3 text-white print:text-black print:bg-gray-100 print:border-gray-300">
              <div className="flex items-center gap-1.5 text-textmut print:text-gray-500 font-bold uppercase tracking-widest text-[9px] mb-1">
                <Calendar className="h-3 w-3" /> Timestamp
              </div>
              <div className="font-bold text-[10px] sm:text-xs font-mono">{new Date().toLocaleString()}</div>
            </div>
            <div className="rounded-xl bg-panel/40 border border-borderd/30 p-3 col-span-2 md:col-span-1 text-white print:text-black print:bg-gray-100 print:border-gray-300">
              <div className="flex items-center gap-1.5 text-textmut print:text-gray-500 font-bold uppercase tracking-widest text-[9px] mb-1">
                <AlertCircle className="h-3 w-3" /> Agency Rank
              </div>
              <div className="font-bold text-xs uppercase tracking-wider text-teal print:text-black flex items-center gap-1">
                <Cpu className="h-3.5 w-3.5" /> Guardian AI
              </div>
            </div>
          </div>

          {/* Simulated typewriter logs */}
          <div className="whitespace-pre-wrap bg-black/35 p-4 rounded-xl border border-white/5 min-h-[220px] print:bg-transparent print:border-none print:p-0 text-white print:text-black leading-relaxed">
            {typedText}
            {isTyping && <span className="animate-ping ml-0.5 font-bold">_</span>}
          </div>

          {/* Signature block for printed document */}
          <div className="hidden print-only mt-12 pt-8 border-t border-dashed border-gray-300 grid grid-cols-2 text-black">
            <div>
              <p className="text-[10px] text-gray-500">DIGITAL AUDIT ID</p>
              <p className="font-mono text-[9px] font-bold text-gray-700">SHA-256: 8a4f91d0ee123b320...f</p>
            </div>
            <div className="text-right">
              <div className="inline-block border-b border-black w-40 h-8"></div>
              <p className="text-[10px] text-gray-500 mr-2 mt-1">AUTHORIZED COMMAND SIGNATURE</p>
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-borderd bg-ink/40 px-6 py-4 no-print">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-xl bg-teal hover:bg-teal/80 px-4 py-2.5 text-xs font-semibold text-white transition-all flex items-center gap-1.5 shadow active:scale-95 cursor-pointer"
          >
            <Printer className="h-4 w-4" /> Print / Save PDF
          </button>
        </div>

      </div>
    </div>
  )
}
