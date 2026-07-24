import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Map, ScanEye, Activity, Gauge, Fish, BellRing, ArrowRight, Waves } from 'lucide-react'
import Seo from '../components/Seo.jsx'
import { Container, SectionHeading } from '../components/ui.jsx'
import OceanHealthGauge from '../components/OceanHealthGauge.jsx'
import { problemStats, pipeline, features, fleetHealthIndex } from '../data/mockData.js'

const iconMap = { Map, ScanEye, Activity, Gauge, Fish, BellRing }

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function Home() {
  return (
    <>
      <Seo
        title="DeepSea Guardian — AI Ocean Monitoring"
        description="Detect pollution, track biodiversity and predict environmental risk across the deep sea — unified in one real-time platform with a predictive Ocean Health Index."
      />

      {/* HERO */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 opacity-60" style={{ background: 'radial-gradient(circle at 70% 10%, #12466e 0%, transparent 55%)' }} />
        <Container className="relative py-20 sm:py-28">
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-teallite">
              <Waves className="h-4 w-4" /> HackOcean 2026 · PS03
            </span>
            <h1 className="mt-5 font-head text-4xl font-extrabold leading-tight sm:text-5xl">
              Guarding the deep ocean — <span className="text-teallite">before the damage is done.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-textmut">
              DeepSea Guardian fuses drones, sonar, satellite and IoT sensors into one real-time platform that
              detects pollution, tracks biodiversity, and predicts environmental risk across the deep sea.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-teal px-6 py-3 font-semibold text-white shadow-lg transition-transform hover:scale-[1.03]">
                Open Live Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/risk-map" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 font-semibold text-white hover:bg-white/10">
                See the Risk Map
              </Link>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* PROBLEM STATS */}
      <section className="bg-sky py-16">
        <Container>
          <SectionHeading eyebrow="The problem" title="The deep sea is under threat — and mostly unwatched." center />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {problemStats.map((s) => (
              <motion.div
                key={s.label}
                initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
                className="rounded-2xl border border-teal/20 bg-white/70 p-5 text-center shadow-sm"
              >
                <div className="font-head text-3xl font-extrabold text-tealink">{s.value}</div>
                <p className="mt-2 text-sm font-medium text-textd/80">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16">
        <Container>
          <SectionHeading eyebrow="How it works" title="From raw signals to real action." center />
          <div className="grid gap-4 md:grid-cols-5">
            {pipeline.map((p) => (
              <div key={p.step} className="rounded-2xl border border-teal/15 bg-white p-5 shadow-sm">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-teal font-head text-sm font-bold text-white">{p.step}</div>
                <h3 className="mt-3 font-head font-semibold text-ink">{p.title}</h3>
                <p className="mt-1 text-sm text-textd/70">{p.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* OCEAN HEALTH INDEX CALLOUT */}
      <section className="bg-ink py-16 text-white">
        <Container className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wide text-health">★ Signature feature</span>
            <h2 className="mt-2 font-head text-3xl font-bold">One score for the whole ocean.</h2>
            <p className="mt-4 text-textmut">
              The <span className="font-semibold text-white">Ocean Health Index</span> distills four threat signals —
              plastic, bleaching, ghost nets and predicted risk — into a single 0–100 number per zone. So anyone can
              see, at a glance, exactly where the ocean needs help.
            </p>
            <Link to="/dashboard" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal px-5 py-3 font-semibold text-white hover:scale-[1.03]">
              Explore the index <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-2xl border border-health/40 bg-panel p-8">
            <p className="mb-2 text-center text-sm text-textmut">Fleet-wide Ocean Health Index</p>
            <OceanHealthGauge score={fleetHealthIndex} size={280} />
          </div>
        </Container>
      </section>

      {/* FEATURES */}
      <section className="py-16">
        <Container>
          <SectionHeading eyebrow="Platform" title="Everything in one command center." center />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = iconMap[f.icon] || Activity
              return (
                <motion.div
                  key={f.title}
                  initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
                  className="rounded-2xl border border-teal/15 bg-white p-6 shadow-sm"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal/10">
                    <Icon className="h-6 w-6 text-tealink" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-head text-lg font-semibold text-ink">{f.title}</h3>
                  <p className="mt-2 text-sm text-textd/70">{f.text}</p>
                </motion.div>
              )
            })}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <Container>
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-teal to-tealink px-8 py-12 text-center text-white">
            <h2 className="font-head text-3xl font-bold">The ocean can't wait.</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/90">
              Start monitoring pollution and biodiversity in real time, and act before the damage becomes irreversible.
            </p>
            <Link to="/dashboard" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-tealink hover:scale-[1.03]">
              Launch the Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>
    </>
  )
}
