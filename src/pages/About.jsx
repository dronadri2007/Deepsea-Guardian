import { Plane, Radar, Satellite, Cpu, Building2, Microscope, HeartHandshake, Users } from 'lucide-react'
import Seo from '../components/Seo.jsx'
import { Container, SectionHeading } from '../components/ui.jsx'
import { pipeline, fleet } from '../data/mockData.js'

const tech = ['React 19', 'Vite', 'React Router', 'Tailwind CSS v4', 'Recharts', 'Framer Motion', 'Vercel']

const dataSources = [
  { icon: Plane, title: 'Underwater Drones', text: 'Autonomous ROVs capture close-range imagery of dumping, ghost nets and habitat damage.' },
  { icon: Radar, title: 'Sonar Arrays', text: 'Multibeam sonar maps the seafloor and detects debris fields, nets and structural changes.' },
  { icon: Satellite, title: 'Satellite Imagery', text: 'Orbital passes flag surface plastic, turbidity plumes and sea-surface temperature anomalies.' },
  { icon: Cpu, title: 'IoT Sensors', text: 'Fixed buoys stream temperature, pH and turbidity readings in real time from every zone.' },
]

const audience = [
  { icon: Building2, title: 'Marine Authorities', text: 'Act on illegal dumping and enforcement alerts with location-precise evidence.' },
  { icon: Microscope, title: 'Researchers', text: 'Track biodiversity trends and long-term ecosystem health with unified data.' },
  { icon: HeartHandshake, title: 'NGOs & Conservationists', text: 'Prioritise cleanup and protection where the Ocean Health Index is lowest.' },
  { icon: Users, title: 'Public Awareness', text: 'Make invisible deep-sea threats visible and understandable to everyone.' },
]

export default function About() {
  return (
    <div className="py-14">
      <Seo
        title="About — DeepSea Guardian"
        description="The mission, technology and team behind DeepSea Guardian, built for HackOcean 2026."
      />
      <Container>
        <SectionHeading eyebrow="About" title="Turning ocean data into early warnings." />
        <p className="max-w-3xl text-lg leading-relaxed text-textd/80">
          Over 80% of the ocean is unexplored and unmonitored. DeepSea Guardian exists to change that — turning
          fragmented data from drones, sonar, satellites and IoT sensors into early warnings that let us protect
          marine ecosystems before harm becomes irreversible.
        </p>

        <div className="mt-12 grid gap-10 md:grid-cols-2">

          {/* Pipeline */}
          <div>
            <h2 className="font-head text-xl font-bold text-ink">How the platform works</h2>
            <ol className="mt-5 space-y-4">
              {pipeline.map((p) => (
                <li key={p.step} className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-teal text-sm font-bold text-white shadow-sm">
                    {p.step}
                  </span>
                  <span className="pt-0.5 leading-relaxed text-textd/80">
                    <b className="text-ink">{p.title}.</b> {p.text}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Right column */}
          <div className="space-y-8">
            {/* Fleet stats */}
            <div>
              <h2 className="font-head text-xl font-bold text-ink">Fleet status</h2>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { value: fleet.drones.online,  label: 'Drones online' },
                  { value: fleet.sensors.online, label: 'IoT sensors' },
                  { value: 6,                    label: 'Active zones' },
                ].map(({ value, label }) => (
                  <div
                    key={label}
                    className="card-hover rounded-2xl border border-teal/15 bg-white p-4 text-center shadow-sm"
                  >
                    <div className="font-head text-2xl font-extrabold text-tealink">{value}</div>
                    <div className="mt-1 text-xs leading-snug text-textd/65">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech stack */}
            <div>
              <h2 className="font-head text-xl font-bold text-ink">Built with</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {tech.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-teal/10 px-3 py-1 text-sm font-medium text-tealink ring-1 ring-teal/15 transition-colors duration-150 hover:bg-teal/20"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Team card */}
            <div className="rounded-2xl bg-ink p-6 text-white shadow-lg">
              <h2 className="font-head text-lg font-bold">Team SRU</h2>
              <p className="mt-2 text-sm leading-relaxed text-textmut">
                HackOcean 2026 · National-Level Frontend Hackathon · Problem PS03 — DeepSea Guardian.
                Data shown is representative for demonstration.
              </p>
            </div>
          </div>
        </div>

        {/* Data sources */}
        <div className="mt-16">
          <h2 className="font-head text-2xl font-bold text-ink">Four data sources, one platform</h2>
          <p className="mt-2 max-w-2xl text-textd/70">
            DeepSea Guardian fuses four independent sensing networks into a single, unified view of the deep ocean.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {dataSources.map((d) => (
              <div key={d.title} className="card-hover rounded-2xl border border-teal/15 bg-white p-6 shadow-sm">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal/10">
                  <d.icon className="h-6 w-6 text-tealink" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-head font-semibold text-ink">{d.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-textd/70">{d.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* The Ocean Health Index */}
        <div className="mt-16 overflow-hidden rounded-3xl bg-ink p-8 text-white sm:p-10">
          <span className="text-sm font-semibold uppercase tracking-widest text-health">★ The signature idea</span>
          <h2 className="mt-3 font-head text-2xl font-bold sm:text-3xl">The Ocean Health Index</h2>
          <p className="mt-3 max-w-3xl text-textmut">
            The hardest part of ocean monitoring isn't collecting data — it's making sense of it. Our Ocean Health Index
            fuses four threat signals (plastic accumulation, coral bleaching, ghost nets and predicted risk) into a single
            0–100 score for every zone, colour-banded so anyone — from a policymaker to a fisherman — can see at a glance
            where the ocean needs help. It turns fragmented, technical data into a decision.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { v: '0–100', l: 'Single health score' },
              { v: '4', l: 'Fused threat signals' },
              { v: '6', l: 'Monitored zones' },
              { v: 'Live', l: 'Recomputed in real time' },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl bg-panel p-4">
                <div className="font-head text-2xl font-extrabold text-teallite">{s.v}</div>
                <div className="mt-1 text-xs text-textmut">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Who it's for */}
        <div className="mt-16">
          <h2 className="font-head text-2xl font-bold text-ink">Who it's for</h2>
          <p className="mt-2 max-w-2xl text-textd/70">
            Turning ocean data into action for the people who can protect it.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {audience.map((a) => (
              <div key={a.title} className="card-hover rounded-2xl border border-teal/15 bg-white p-6 shadow-sm">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal/10">
                  <a.icon className="h-6 w-6 text-tealink" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-head font-semibold text-ink">{a.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-textd/70">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  )
}
