import { createContext, useContext, useState, useEffect, useRef } from 'react'
import {
  zones as initialZones,
  alerts as initialAlerts,
  detections as initialDetections,
  sensorLayers,
  oceanHealthIndex,
  healthBand,
} from '../data/mockData.js'

const AppContext = createContext(null)

// ─────────────────────────────────────────────────────────────────────────────
//  Audio Synthesizer Engine (Web Audio API)
// ─────────────────────────────────────────────────────────────────────────────
let audioCtx = null

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

function playSynthSound(type) {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Master Volume Control
    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(0.12, now)
    masterGain.connect(ctx.destination)

    if (type === 'sonar') {
      // Muffled sonar ping: 850Hz sine wave decaying exponentially
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(850, now)
      // Slight pitch glide downwards to sound "underwater"
      osc.frequency.exponentialRampToValueAtTime(780, now + 1.2)

      gainNode.gain.setValueAtTime(1.0, now)
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5)

      // Add a quick noise burst to simulate sonar reflections
      const bufferSize = ctx.sampleRate * 0.15
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }
      const noise = ctx.createBufferSource()
      noise.buffer = buffer

      const noiseFilter = ctx.createBiquadFilter()
      noiseFilter.type = 'bandpass'
      noiseFilter.frequency.value = 800
      noiseFilter.Q.value = 8.0

      const noiseGain = ctx.createGain()
      noiseGain.gain.setValueAtTime(0.18, now)
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

      noise.connect(noiseFilter)
      noiseFilter.connect(noiseGain)
      noiseGain.connect(masterGain)

      osc.connect(gainNode)
      gainNode.connect(masterGain)

      osc.start(now)
      osc.stop(now + 1.6)
      noise.start(now)
      noise.stop(now + 0.20)
    }
    else if (type === 'alarm') {
      // Dual oscillator siren
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gainNode = ctx.createGain()

      osc1.type = 'sawtooth'
      osc2.type = 'sine'

      osc1.frequency.setValueAtTime(220, now)
      osc2.frequency.setValueAtTime(225, now)

      // Pitch sweep
      osc1.frequency.linearRampToValueAtTime(280, now + 0.2)
      osc1.frequency.linearRampToValueAtTime(220, now + 0.4)
      osc2.frequency.linearRampToValueAtTime(285, now + 0.2)
      osc2.frequency.linearRampToValueAtTime(225, now + 0.4)

      gainNode.gain.setValueAtTime(0.7, now)
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 600

      osc1.connect(filter)
      osc2.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(masterGain)

      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + 0.5)
      osc2.stop(now + 0.5)
    }
    else if (type === 'success') {
      // Positive chord arpeggio: C major chord notes
      const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gainNode = ctx.createGain()

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now + idx * 0.1)

        gainNode.gain.setValueAtTime(0.6, now + idx * 0.1)
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4)

        osc.connect(gainNode)
        gainNode.connect(masterGain)

        osc.start(now + idx * 0.1)
        osc.stop(now + idx * 0.1 + 0.4)
      })
    }
    else if (type === 'click') {
      // Soft highpass click
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(1500, now)

      gainNode.gain.setValueAtTime(0.3, now)
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

      osc.connect(gainNode)
      gainNode.connect(masterGain)

      osc.start(now)
      osc.stop(now + 0.06)
    }
  } catch (e) {
    console.warn('Web Audio error:', e)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Provider Component
// ─────────────────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [zones, setZones] = useState(() => {
    const saved = localStorage.getItem('dsg_zones')
    return saved ? JSON.parse(saved) : initialZones
  })

  const [alerts, setAlerts] = useState(() => {
    const saved = localStorage.getItem('dsg_alerts')
    return saved ? JSON.parse(saved) : initialAlerts
  })

  const [detections, setDetections] = useState(() => {
    const saved = localStorage.getItem('dsg_detections')
    return saved ? JSON.parse(saved) : initialDetections
  })

  const [drones, setDrones] = useState(() => {
    const saved = localStorage.getItem('dsg_drones')
    return saved ? JSON.parse(saved) : sensorLayers.drones
  })

  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('dsg_sound') === 'true'
  })

  const [lightAngle, setLightAngle] = useState(135)
  const [activeReport, setActiveReport] = useState(null)
  const [simModeActive, setSimModeActive] = useState(false)

  // Track animation frame loop references
  const animRefs = useRef({})

  // Synchronize state with LocalStorage
  useEffect(() => {
    localStorage.setItem('dsg_zones', JSON.stringify(zones))
    // Calculate if anything is simulated/changed from default
    const isSimulated = zones.some((z) => {
      const init = initialZones.find((iz) => iz.id === z.id)
      return init.plastic !== z.plastic || init.bleaching !== z.bleaching || init.ghostNets !== z.ghostNets || init.risk !== z.risk
    })
    setSimModeActive(isSimulated)
  }, [zones])

  useEffect(() => {
    localStorage.setItem('dsg_alerts', JSON.stringify(alerts))
  }, [alerts])

  useEffect(() => {
    localStorage.setItem('dsg_detections', JSON.stringify(detections))
  }, [detections])

  useEffect(() => {
    localStorage.setItem('dsg_drones', JSON.stringify(drones))
  }, [drones])

  useEffect(() => {
    localStorage.setItem('dsg_sound', soundEnabled ? 'true' : 'false')
  }, [soundEnabled])

  // Play audio triggers
  const triggerSound = (type) => {
    if (soundEnabled) {
      playSynthSound(type)
    }
  }

  // Update a zone's metrics
  const updateZoneReading = (zoneId, field, value) => {
    setZones((prev) =>
      prev.map((z) => {
        if (z.id === zoneId) {
          const updated = { ...z, [field]: value }
          // If a zone is pushed to extreme conditions, trigger corresponding alerts
          if (field === 'plastic' && value === 3 && z.plastic !== 3) {
            triggerSystemAlert('Plastic accumulation', zoneId, 'Critical')
          }
          if (field === 'bleaching' && value === 3 && z.bleaching !== 3) {
            triggerSystemAlert('Coral bleaching', zoneId, 'Critical')
          }
          if (field === 'ghostNets' && value >= 4 && z.ghostNets < 4) {
            triggerSystemAlert('Ghost net cluster', zoneId, 'High')
          }
          return updated
        }
        return z
      })
    )
  }

  // Programmatically inject alerts and detections
  const triggerSystemAlert = (type, zoneId, severity) => {
    const zoneName = zones.find((z) => z.id === zoneId)?.name || zoneId
    const newAlertId = `ALT-${Math.floor(1000 + Math.random() * 9000)}`

    // Add alert
    setAlerts((prev) => [
      {
        id: newAlertId,
        zone: zoneId,
        type,
        severity,
        status: 'Open',
        raised: 'Just now',
      },
      ...prev,
    ])

    // Add AI detection
    setDetections((prev) => [
      {
        id: Date.now(),
        type: `${type} detected`,
        detail: severity === 'Critical' ? 'Immediate threat' : 'Telemetry anomaly',
        zone: zoneId,
        confidence: Math.floor(85 + Math.random() * 14),
        severity: severity.toLowerCase() === 'critical' ? 'critical' : severity.toLowerCase() === 'high' ? 'warning' : 'info',
        time: 'Just now',
      },
      ...prev,
    ])

    triggerSound('alarm')
  }

  // Pre-defined disaster simulation buttons
  const triggerPresetEvent = (presetType) => {
    triggerSound('alarm')
    if (presetType === 'oil-spill') {
      updateZoneReading('C-4', 'plastic', 3)
      updateZoneReading('C-4', 'risk', 'high')
      triggerSystemAlert('Heavy oil/petroleum slick', 'C-4', 'Critical')
    } else if (presetType === 'marine-heatwave') {
      updateZoneReading('A-7', 'bleaching', 3)
      updateZoneReading('A-7', 'risk', 'high')
      triggerSystemAlert('Thermal anomaly / Bleaching', 'A-7', 'Critical')
    } else if (presetType === 'ghost-net-trawl') {
      updateZoneReading('D-1', 'ghostNets', 5)
      updateZoneReading('D-1', 'risk', 'high')
      triggerSystemAlert('Commercial ghost net drift', 'D-1', 'High')
    }
  }

  // Reset simulation back to defaults
  const resetSimulation = () => {
    triggerSound('success')
    setZones(initialZones)
    setAlerts(initialAlerts)
    setDetections(initialDetections)
    setDrones(sensorLayers.drones)
    setActiveReport(null)
    setSimModeActive(false)
    // Clear any active animation loops
    Object.values(animRefs.current).forEach(cancelAnimationFrame)
    animRefs.current = {}
  }

  // Redirect drone & resolve threats
  const redirectDrone = (droneId, targetZoneId) => {
    triggerSound('click')
    const targetZone = zones.find((z) => z.id === targetZoneId)
    if (!targetZone) return

    // Update status to patrolling
    setDrones((prev) =>
      prev.map((d) => (d.id === droneId ? { ...d, status: 'patrolling', targetZoneId } : d))
    )

    // Interpolation loop inside requestAnimationFrame
    const startDrone = drones.find((d) => d.id === droneId)
    if (!startDrone) return

    const startX = startDrone.x
    const startY = startDrone.y
    const destX = targetZone.x
    const destY = targetZone.y

    const duration = 4000 // 4 seconds travel time
    const startTime = performance.now()

    if (animRefs.current[droneId]) {
      cancelAnimationFrame(animRefs.current[droneId])
    }

    const animate = (time) => {
      const elapsed = time - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing curve (easeInOutQuad)
      const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2

      const currentX = startX + (destX - startX) * ease
      const currentY = startY + (destY - startY) * ease

      setDrones((prev) =>
        prev.map((d) =>
          d.id === droneId
            ? {
                ...d,
                x: parseFloat(currentX.toFixed(2)),
                y: parseFloat(currentY.toFixed(2)),
                battery: Math.max(10, d.battery - 1),
              }
            : d
        )
      )

      if (progress < 1) {
        animRefs.current[droneId] = requestAnimationFrame(animate)
      } else {
        // Drone arrived! Set to scanning
        setDrones((prev) =>
          prev.map((d) => (d.id === droneId ? { ...d, status: 'scanning' } : d))
        )
        triggerSound('sonar')

        // Start scanning cycle (3 seconds), then clean zone
        setTimeout(() => {
          setZones((prevZones) =>
            prevZones.map((z) => {
              if (z.id === targetZoneId) {
                // Return reading to healthy state
                return {
                  ...z,
                  plastic: Math.max(0, z.plastic - 2),
                  bleaching: Math.max(0, z.bleaching - 1),
                  ghostNets: Math.max(0, z.ghostNets - 3),
                  risk: 'low',
                }
              }
              return z
            })
          )

          // Mark alerts in that zone resolved
          setAlerts((prevAlerts) =>
            prevAlerts.map((a) =>
              a.zone === targetZoneId && a.status !== 'Resolved'
                ? { ...a, status: 'Resolved' }
                : a
            )
          )

          // Set drone back to idle
          setDrones((prev) =>
            prev.map((d) => (d.id === droneId ? { ...d, status: 'surveying' } : d))
          )

          triggerSound('success')
        }, 3000)
      }
    }

    animRefs.current[droneId] = requestAnimationFrame(animate)
  }

  // Calculate fleet health score from current zones state
  const fleetHealth = Math.round(
    zones.reduce((s, z) => s + oceanHealthIndex(z), 0) / zones.length
  )

  const activeAlertsCount = alerts.filter((a) => a.status === 'Open').length

  return (
    <AppContext.Provider
      value={{
        zones,
        alerts,
        detections,
        drones,
        soundEnabled,
        setSoundEnabled,
        lightAngle,
        setLightAngle,
        activeReport,
        setActiveReport,
        simModeActive,
        fleetHealth,
        activeAlertsCount,
        updateZoneReading,
        triggerPresetEvent,
        resetSimulation,
        redirectDrone,
        triggerSound,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
