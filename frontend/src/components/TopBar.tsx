import { useBanking } from '../context/BankingContext'
import { UserIcon, BellIcon } from './icons'

export function TopBar() {
  const { auth } = useBanking()

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-brand-border bg-brand-dark/50 px-6 backdrop-blur-xl lg:px-10">
      <div className="flex items-center gap-4 lg:hidden">
        {/* Mobile menu button would go here */}
      </div>

      <div className="hidden lg:block">
        <h2 className="text-lg font-semibold text-white">Dashboard</h2>
        <p className="text-xs text-slate-400">Welcome back, {auth.user?.name}</p>
      </div>

      <div className="flex items-center gap-4">
        <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border text-slate-400 transition hover:bg-white/5 hover:text-white">
          <BellIcon className="h-5 w-5" />
        </button>
        
        <div className="h-8 w-px bg-brand-border mx-2"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{auth.user?.name}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{auth.user?.email}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 border border-brand-border text-brand-primary shadow-inner">
            <UserIcon className="h-6 w-6" />
          </div>
        </div>
      </div>
    </header>
  )
}
