import Seo from '../components/Seo.jsx'
import { Container, SectionHeading } from '../components/ui.jsx'
import { pipeline, fleet } from '../data/mockData.js'

const tech = ['React 19', 'Vite', 'React Router', 'Tailwind CSS v4', 'Recharts', 'Framer Motion', 'Vercel']

export default function About() {
  return (
    <div className="py-12">
      <Seo title="About — DeepSea Guardian" description="The mission, technology and team behind DeepSea Guardian, built for HackOcean 2026." />
      <Container>
        <SectionHeading eyebrow="About" title="Turning ocean data into early warnings." />
        <p className="max-w-3xl text-lg text-textd/80">
          Over 80% of the ocean is unexplored and unmonitored. DeepSea Guardian exists to change that — turning
          fragmented data from drones, sonar, satellites and IoT sensors into early warnings that let us protect
          marine ecosystems before harm becomes irreversible.
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-head text-xl font-bold text-ink">How the platform works</h2>
            <ol className="mt-4 space-y-3">
              {pipeline.map((p) => (
                <li key={p.step} className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-teal text-sm font-bold text-white">{p.step}</span>
                  <span className="text-textd/80"><b className="text-ink">{p.title}.</b> {p.text}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="font-head text-xl font-bold text-ink">Fleet status</h2>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-teal/15 bg-white p-4 text-center shadow-sm">
                <div className="font-head text-2xl font-extrabold text-tealink">{fleet.drones.online}</div>
                <div className="text-xs text-textd/70">drones online</div>
              </div>
              <div className="rounded-2xl border border-teal/15 bg-white p-4 text-center shadow-sm">
                <div className="font-head text-2xl font-extrabold text-tealink">{fleet.sensors.online}</div>
                <div className="text-xs text-textd/70">IoT sensors</div>
              </div>
              <div className="rounded-2xl border border-teal/15 bg-white p-4 text-center shadow-sm">
                <div className="font-head text-2xl font-extrabold text-tealink">6</div>
                <div className="text-xs text-textd/70">active zones</div>
              </div>
            </div>

            <h2 className="mt-8 font-head text-xl font-bold text-ink">Built with</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {tech.map((t) => (
                <span key={t} className="rounded-full bg-teal/10 px-3 py-1 text-sm font-medium text-tealink">{t}</span>
              ))}
            </div>

            <div className="mt-8 rounded-2xl bg-ink p-6 text-white">
              <h2 className="font-head text-lg font-bold">Team SRU</h2>
              <p className="mt-1 text-sm text-textmut">HackOcean 2026 · National-Level Frontend Hackathon · Problem PS03 — DeepSea Guardian. Data shown is representative for demonstration.</p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
