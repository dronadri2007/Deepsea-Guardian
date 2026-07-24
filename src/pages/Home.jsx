import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Map, ScanEye, Activity, Gauge, Fish, BellRing, ArrowRight, Waves } from 'lucide-react'
import Seo from '../components/Seo.jsx'
import { Container, SectionHeading } from '../components/ui.jsx'
import OceanHealthGauge from '../components/OceanHealthGauge.jsx'
import { problemStats, pipeline, features, fleetHealthIndex } from '../data/mockData.js'

const iconMap = { Map, ScanEye, Activity, Gauge, Fish, BellRing }

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

export default function Home() {
  return (
    <>
      <Seo
        title="DeepSea Guardian — AI Ocean Monitoring"
        description="Detect pollution, track biodiversity and predict environmental risk across the deep sea — unified in one real-time platform with a predictive Ocean Health Index."
      />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-ink text-white">
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 75% 0%, #12466e 0%, transparent 65%), radial-gradient(ellipse 40% 30% at 10% 80%, #0b4a44 0%, transparent 60%)',
          }}
        />

        <Container className="relative py-24 sm:py-32">
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-sm text-teallite ring-1 ring-white/10">
              <Waves className="h-4 w-4" /> HackOcean 2026 · PS03
            </span>
            <h1 className="mt-6 font-head text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
              Guarding the deep ocean —{' '}
              <span className="text-teallite">before the damage is done.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">
              DeepSea Guardian fuses drones, sonar, satellite and IoT sensors into one real-time platform that
              detects pollution, tracks biodiversity, and predicts environmental risk across the deep sea.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-teal px-6 py-3 font-semibold text-white shadow-lg btn-transition"
              >
                Open Live Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/risk-map"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-6 py-3 font-semibold text-white transition-colors duration-150 hover:bg-white/10 hover:border-white/40"
              >
                See the Risk Map
              </Link>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* ── PROBLEM STATS ── */}
      <section className="bg-sky py-20">
        <Container>
          <SectionHeading eyebrow="The problem" title="The deep sea is under threat — and mostly unwatched." center />
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-2 gap-4 lg:grid-cols-4"
          >
            {problemStats.map((s) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                className="card-hover rounded-2xl border border-teal/20 bg-white/80 p-5 text-center shadow-sm backdrop-blur-sm"
              >
                <div className="font-head text-3xl font-extrabold text-tealink">{s.value}</div>
                <p className="mt-2 text-sm font-medium leading-snug text-textd/75">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20">
        <Container>
          <SectionHeading eyebrow="How it works" title="From raw signals to real action." center />
          {/* Scrollable on mobile, 5-col grid on md+ */}
          <div className="-mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6 md:overflow-visible">
            <div className="flex gap-4 md:grid md:grid-cols-5" style={{ minWidth: 'max-content' }}>
              {pipeline.map((p, i) => (
                <div
                  key={p.step}
                  className="card-hover w-52 flex-shrink-0 rounded-2xl border border-teal/15 bg-white p-5 shadow-sm md:w-auto"
                >
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-teal font-head text-sm font-bold text-white shadow-sm">
                    {p.step}
                  </div>
                  <h3 className="mt-3 font-head font-semibold text-ink">{p.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-textd/70">{p.text}</p>
                  {/* Connector arrow — desktop only */}
                  {i < pipeline.length - 1 && (
                    <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-full text-teal/40 px-1 text-lg leading-none pointer-events-none">
                      ›
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-textd/40 md:hidden">← scroll to see all steps →</p>
        </Container>
      </section>

      {/* ── OCEAN HEALTH INDEX ── */}
      <section className="bg-ink py-20 text-white">
        <Container className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-health">★ Signature feature</span>
            <h2 className="mt-3 font-head text-3xl font-bold leading-snug">One score for the whole ocean.</h2>
            <p className="mt-4 leading-relaxed text-white/65">
              The <span className="font-semibold text-white">Ocean Health Index</span> distills four threat signals —
              plastic, bleaching, ghost nets and predicted risk — into a single 0–100 number per zone. So anyone can
              see, at a glance, exactly where the ocean needs help.
            </p>
            <Link
              to="/dashboard"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-teal px-5 py-3 font-semibold text-white shadow-md btn-transition"
            >
              Explore the index <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-2xl border border-health/30 bg-panel p-8 shadow-lg shadow-health/5">
            <p className="mb-3 text-center text-sm text-textmut">Fleet-wide Ocean Health Index</p>
            <OceanHealthGauge score={fleetHealthIndex} size={280} />
          </div>
        </Container>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20">
        <Container>
          <SectionHeading eyebrow="Platform" title="Everything in one command center." center />
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((f) => {
              const Icon = iconMap[f.icon] || Activity
              return (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  className="card-hover group rounded-2xl border border-teal/15 bg-white p-6 shadow-sm"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal/10 transition-colors duration-200 group-hover:bg-teal/15">
                    <Icon className="h-6 w-6 text-tealink" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-head text-lg font-semibold text-ink">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-textd/70">{f.text}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </Container>
      </section>

      {/* ── CTA ── */}
      <section className="pb-24 pt-4">
        <Container>
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-teal to-tealink px-8 py-14 text-center text-white shadow-xl shadow-teal/20 sm:px-12">
            <h2 className="font-head text-3xl font-bold sm:text-4xl">The ocean can't wait.</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/85 leading-relaxed">
              Start monitoring pollution and biodiversity in real time, and act before the damage becomes irreversible.
            </p>
            <Link
              to="/dashboard"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-tealink shadow-md btn-transition"
            >
              Launch the Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>
    </>
  )
}
