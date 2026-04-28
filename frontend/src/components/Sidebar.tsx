import { useBanking } from '../context/BankingContext'
import { BankIcon, LayoutIcon, WalletIcon, TransferIcon, ShieldIcon, LogoutIcon } from './icons'

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: any) => void
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const { isSystemUser, signOut } = useBanking()

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutIcon },
    { id: 'accounts', label: 'Accounts', icon: WalletIcon },
    { id: 'transfers', label: 'Transfers', icon: TransferIcon },
    { id: 'security', label: 'Security', icon: ShieldIcon },
  ]

  if (isSystemUser) {
    navItems.splice(3, 0, { id: 'treasury', label: 'Treasury', icon: ShieldIcon })
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-brand-border bg-brand-dark/50 backdrop-blur-xl transition-transform -translate-x-full lg:translate-x-0">
      <div className="flex h-full flex-col px-4 py-6">
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary shadow-lg shadow-brand-primary/20">
            <BankIcon className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">BankLedger</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                activeSection === item.id
                  ? 'bg-brand-primary/10 text-brand-primary shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`h-5 w-5 ${activeSection === item.id ? 'text-brand-primary' : ''}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-rose-400 transition-all hover:bg-rose-500/10 hover:text-rose-300"
          >
            <LogoutIcon className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  )
}
