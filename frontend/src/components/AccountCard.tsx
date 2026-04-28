import { formatCurrency } from '../lib/format'
import { WalletIcon, SearchIcon, PlusIcon } from './icons'
import type { Account } from '../types'

interface AccountCardProps {
  account: Account
  balance: number
  onRefresh: (id: string) => void
  isRefreshing: boolean
  onAddFunds?: (id: string) => void
}

export function AccountCard({ account, balance, onRefresh, isRefreshing, onAddFunds }: AccountCardProps) {
  return (
    <div className="glass fintech-card-hover group relative overflow-hidden rounded-[2rem] p-8">
      <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-brand-primary/5 blur-3xl transition-all group-hover:bg-brand-primary/10"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-brand-primary border border-white/10 group-hover:border-brand-primary/30 transition-colors">
            <WalletIcon className="h-6 w-6" />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onRefresh(account._id)}
              disabled={isRefreshing}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 transition-all disabled:opacity-50"
              title="Refresh Balance"
            >
              <SearchIcon className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            {onAddFunds && (
              <button 
                onClick={() => onAddFunds(account._id)}
                className="flex h-10 px-4 items-center gap-2 rounded-xl bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-brand-dark border border-brand-primary/20 transition-all font-bold text-xs"
              >
                <PlusIcon className="h-4 w-4" />
                Add Funds
              </button>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Available Balance</p>
          <p className="text-4xl font-bold tracking-tight text-white">
            {formatCurrency(balance, account.currency)}
          </p>
        </div>

        <div className="mt-auto pt-10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">Account Number</p>
              <p className="font-mono text-sm text-slate-300 tracking-wider">
                {account._id}
              </p>
            </div>
            <div className="rounded-lg bg-brand-primary/20 px-3 py-1 border border-brand-primary/20">
              <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">{account.status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
