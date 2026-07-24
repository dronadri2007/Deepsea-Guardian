import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import MitigationReportModal from './MitigationReportModal.jsx'
import { useApp } from '../context/AppContext.jsx'

export default function Layout() {
  const { simModeActive, resetSimulation } = useApp()

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-teal focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <Navbar />
      {simModeActive && (
        <div className="bg-gradient-to-r from-amber-600 to-red-600 px-4 py-2 text-center text-xs font-semibold text-white shadow-sm flex items-center justify-center gap-3 z-30">
          <span>⚠️ Simulation Mode Active: Local metrics modified.</span>
          <button
            type="button"
            onClick={resetSimulation}
            className="rounded bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-white/30 active:scale-95 transition-all"
          >
            Reset Fleet
          </button>
        </div>
      )}
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <MitigationReportModal />
      <Footer />
    </div>
  )
}


