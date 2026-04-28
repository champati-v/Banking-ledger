import { useState } from 'react'
import { LandingPage } from './features/landing/LandingPage'
import { Dashboard } from './features/dashboard/Dashboard'
import { BankingProvider, useBanking } from './context/BankingContext'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { CheckIcon, AlertIcon } from './components/icons'

function AppContent() {
  const { isHydrated, toasts, dismissToast, auth } = useBanking()
  const [activeSection, setActiveSection] = useState('overview')

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-dark text-white">
        <div className="glass rounded-3xl px-8 py-6 text-center shadow-2xl">
          <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-2xl bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center">
            <div className="h-6 w-6 rounded-full bg-brand-primary"></div>
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-primary">Initializing Ledger</p>
        </div>
      </div>
    )
  }

  const toastTone = (tone: string) => {
    if (tone === 'error') return <AlertIcon className="h-5 w-5" />
    return <CheckIcon className="h-5 w-5" />
  }

  if (!auth.user) {
    return (
      <div className="min-h-screen">
        <LandingPage />
        <ToastContainer toasts={toasts} dismissToast={dismissToast} toastTone={toastTone} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-dark text-white lg:flex">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <div className="flex-1 lg:ml-64">
        <TopBar />
        <main className="p-6 lg:p-10">
          <Dashboard activeSection={activeSection} setActiveSection={setActiveSection} />
        </main>
      </div>

      <ToastContainer toasts={toasts} dismissToast={dismissToast} toastTone={toastTone} />
    </div>
  )
}

function ToastContainer({ toasts, dismissToast, toastTone }: any) {
  return (
    <div className="fixed right-6 top-6 z-[100] flex w-full max-w-sm flex-col gap-4">
      {toasts.map((toast: any) => (
        <button
          key={toast.id}
          onClick={() => dismissToast(toast.id)}
          className={`glass flex items-start gap-4 rounded-2xl p-5 text-left shadow-2xl transition-all hover:scale-[1.02] animate-fade-in ${
            toast.tone === 'error' ? 'border-rose-500/30' : 'border-brand-primary/30'
          }`}
        >
          <div className={`mt-0.5 rounded-xl p-2 ${
            toast.tone === 'error' ? 'bg-rose-500/20 text-rose-500' : 'bg-brand-primary/20 text-brand-primary'
          }`}>
            {toastTone(toast.tone)}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">{toast.title}</p>
            {toast.description && <p className="mt-1 text-xs leading-relaxed text-slate-400">{toast.description}</p>}
          </div>
        </button>
      ))}
    </div>
  )
}

export default function App() {
  return (
    <BankingProvider>
      <AppContent />
    </BankingProvider>
  )
}

