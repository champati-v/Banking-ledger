import { formatCurrency, formatDateTime } from '../lib/format'
import { ArrowUpRightIcon, ArrowDownLeftIcon } from './icons'
import type { Transaction } from '../types'

interface TransactionListProps {
  transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500">
        <p className="text-sm">No transactions found.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      <table className="w-full text-left">
        <thead className="border-b border-brand-border bg-white/5">
          <tr>
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Transaction</th>
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Date</th>
            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {transactions.map((tx) => {
            const isDebit = true // In a real app, we'd check if fromAccount matches current user's accounts
            return (
              <tr key={tx._id || tx.idempotencyKey} className="group hover:bg-white/5 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                      isDebit ? 'border-rose-500/20 bg-rose-500/10 text-rose-500' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {isDebit ? <ArrowUpRightIcon className="h-5 w-5" /> : <ArrowDownLeftIcon className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Transfer to {tx.toAccount.slice(-8)}</p>
                      <p className="text-xs text-slate-500 font-mono">ID: {tx.idempotencyKey.slice(0, 8)}...</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                    tx.status === 'COMPLETED' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500' : 
                    tx.status === 'PENDING' ? 'border-amber-500/20 bg-amber-500/10 text-amber-500' : 
                    'border-rose-500/20 bg-rose-500/10 text-rose-500'
                  }`}>
                    {tx.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm text-slate-400">
                  {formatDateTime(tx.createdAt)}
                </td>
                <td className={`px-6 py-5 text-right text-sm font-bold ${isDebit ? 'text-white' : 'text-emerald-500'}`}>
                  {isDebit ? '-' : '+'}{formatCurrency(tx.amount)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
