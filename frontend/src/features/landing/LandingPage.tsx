import { AuthPanel } from '../auth/AuthPanel'
import { BankIcon, ShieldIcon, TransferIcon, WalletIcon } from '../../components/icons'

export function LandingPage() {
  const features = [
    { icon: ShieldIcon, title: 'Secure Infrastructure', text: 'JWT-based authentication with session blacklisting and secure cookie handling.' },
    { icon: WalletIcon, title: 'Asset Management', text: 'Real-time account creation and balance tracking across multiple currencies.' },
    { icon: TransferIcon, title: 'Idempotent Transfers', text: 'Retry-safe fund movements with unique idempotency keys to prevent duplication.' },
    { icon: BankIcon, title: 'Institutional Grade', text: 'A refined, high-performance interface designed for modern financial operations.' },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-dark text-white">
      {/* Background Orbs */}
      <div className="absolute left-0 top-0 -ml-24 -mt-24 h-96 w-96 rounded-full bg-brand-primary/10 blur-[120px]"></div>
      <div className="absolute right-0 bottom-0 -mr-24 -mb-24 h-96 w-96 rounded-full bg-brand-primary/5 blur-[120px]"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <main className="relative mx-auto grid min-h-screen max-w-7xl gap-16 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-12 lg:py-20">
        <section className="flex flex-col justify-center gap-12">
          <div className="animate-fade-in inline-flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 backdrop-blur-xl transition hover:border-brand-primary/30">
            <div className="h-2 w-2 rounded-full bg-brand-primary animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">Corporate Grade Security</span>
          </div>

          <div className="max-w-2xl space-y-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-6xl font-bold tracking-tight text-white lg:text-8xl leading-[1.1]">
              The next gen <br />
              <span className="text-brand-primary">banking ledger.</span>
            </h1>
            <p className="max-w-xl text-xl leading-relaxed text-slate-400">
              A institutional-grade platform for managing assets, tracking transactions, and executing secure transfers with absolute precision.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="glass group rounded-3xl p-6 transition-all hover:border-brand-primary/30 hover:bg-white/10">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-400">{feature.text}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="flex items-center justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="w-full max-w-lg">
            <div className="mb-8 glass rounded-3xl p-6 border-brand-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary mb-1">Access Gateway</p>
                  <p className="text-sm text-slate-300">Secure Authentication Layer Enabled</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary shadow-lg shadow-brand-primary/20">
                  <ShieldIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="glass rounded-[2.5rem] p-1 overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
              <AuthPanel />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

