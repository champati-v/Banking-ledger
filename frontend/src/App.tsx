import { LandingPage } from './features/landing/LandingPage'
import { Dashboard } from './features/dashboard/Dashboard'
import { BankingProvider, useBanking } from './context/BankingContext'
import { CheckIcon, AlertIcon } from './components/icons'

function AppContent() {
  const { activeView, isHydrated, toasts, dismissToast, auth } = useBanking()

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-center backdrop-blur">
          <div className="mx-auto mb-3 h-10 w-10 animate-pulse rounded-2xl bg-white/10" />
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-300">Loading Bank Ledger</p>
        </div>
      </div>
    )
  }

  const toastTone = (tone: string) => {
    if (tone === 'error') return <AlertIcon className="h-4 w-4" />
    return <CheckIcon className="h-4 w-4" />
  }

  return (
    <div className="min-h-screen">
      {activeView === 'landing' && !auth.user ? <LandingPage /> : <Dashboard />}

      <div className="fixed right-4 top-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 md:right-6 md:top-6">
        {toasts.map((toast) => (
          <button
            key={toast.id}
            onClick={() => dismissToast(toast.id)}
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-left shadow-xl backdrop-blur transition hover:-translate-y-0.5 ${
              toast.tone === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-800'
                : toast.tone === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-white/90 text-slate-800'
            }`}
          >
            <div className="mt-0.5 rounded-xl bg-slate-950 p-2 text-white">{toastTone(toast.tone)}</div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description && <p className="mt-1 text-sm leading-6 opacity-80">{toast.description}</p>}
            </div>
          </button>
        ))}
      </div>
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

