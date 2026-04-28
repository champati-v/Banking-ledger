import { useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { AlertIcon, PlusIcon, TransferIcon, WalletIcon, ShieldIcon } from '../../components/icons'
import { useBanking } from '../../context/BankingContext'
import { formatCurrency } from '../../lib/format'
import { AccountCard } from '../../components/AccountCard'
import { TransactionList } from '../../components/TransactionList'

interface DashboardProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

export function Dashboard({ activeSection, setActiveSection }: DashboardProps) {
  const {
    accounts,
    transactions,
    balances,
    isBusy,
    isSystemUser,
    addAccount,
    fetchBalance,
    transferFunds,
    fundInitialAccount,
    seedIdempotencyKey,
  } = useBanking()

  const totalBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + (balances[account._id] ?? 0), 0),
    [accounts, balances],
  )

  const [refreshingId, setRefreshingId] = useState<string | null>(null)
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const [fundAmount, setFundAmount] = useState('')

  const handleRefresh = async (id: string) => {
    setRefreshingId(id)
    try {
      await fetchBalance(id)
    } finally {
      setRefreshingId(null)
    }
  }

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAccountId || !fundAmount) return
    try {
      await fundInitialAccount({ toAccount: selectedAccountId, amount: Number(fundAmount), idempotencyKey: seedIdempotencyKey() })
      setSelectedAccountId(null)
      setFundAmount('')
    } catch (err) {
      console.error('Failed to add funds:', err)
    }
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {isSystemUser && activeSection === 'overview' && (
        <div className="glass bg-brand-primary/5 border-brand-primary/20 rounded-[2rem] p-8 flex items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
            <ShieldIcon className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">System Treasury Access</h2>
            <p className="text-slate-400">You are logged in as a System User. Full database privileges active.</p>
          </div>
          <Button onClick={() => setActiveSection('treasury')} className="ml-auto bg-brand-primary text-brand-dark font-bold rounded-xl px-6 h-12">
            Open Treasury Tool
          </Button>
        </div>
      )}

      {activeSection === 'overview' && (
        <>
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="glass rounded-[2rem] p-8 bg-brand-primary/10 border-brand-primary/20">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary mb-2">
                {isSystemUser ? 'Global System Liquidity' : 'Total Combined Balance'}
              </p>
              <p className="text-5xl font-bold text-white tracking-tight">{formatCurrency(totalBalance)}</p>
              <div className="mt-6 flex items-center gap-2 text-sm text-slate-400">
                <div className="h-2 w-2 rounded-full bg-brand-primary"></div>
                <span>Across {accounts.length} {isSystemUser ? 'global' : 'active'} accounts</span>
              </div>
            </div>

            <div className="glass rounded-[2rem] p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
                {isSystemUser ? 'Global Transactions' : 'Recent Activity'}
              </p>
              <p className="text-4xl font-bold text-white tracking-tight">{transactions.length}</p>
              <p className="mt-4 text-sm text-slate-500">
                {isSystemUser ? 'Total records in ledger' : 'Transactions processed in this session'}
              </p>
            </div>

            <div className="glass rounded-[2rem] p-8 flex flex-col justify-center">
               {isSystemUser ? (
                 <Button onClick={() => setActiveSection('treasury')} className="w-full bg-brand-primary hover:bg-brand-primary/90 text-brand-dark font-bold h-14 rounded-2xl">
                    <PlusIcon className="mr-2 h-5 w-5" />
                    Grant Initial Funds
                 </Button>
               ) : (
                 <>
                   <Button onClick={() => setActiveSection('transfers')} className="w-full bg-brand-primary hover:bg-brand-primary/90 text-brand-dark font-bold h-14 rounded-2xl">
                     <TransferIcon className="mr-2 h-5 w-5" />
                     New Transfer
                   </Button>
                   <Button variant="ghost" onClick={() => setActiveSection('accounts')} className="mt-3 w-full text-slate-400 hover:text-white font-medium">
                     <PlusIcon className="mr-2 h-4 w-4" />
                     Open Account
                   </Button>
                 </>
               )}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{isSystemUser ? 'All Accounts' : 'Your Accounts'}</h3>
              <button onClick={() => setActiveSection('accounts')} className="text-sm font-bold text-brand-primary hover:underline">View All</button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {accounts.slice(0, 3).map(account => (
                <AccountCard 
                  key={account._id} 
                  account={account} 
                  balance={balances[account._id] ?? 0}
                  onRefresh={handleRefresh}
                  isRefreshing={refreshingId === account._id}
                  onAddFunds={isSystemUser ? (id: string) => setSelectedAccountId(id) : undefined}
                />
              ))}
              {accounts.length === 0 && (
                <div className="md:col-span-2 lg:col-span-3 glass rounded-[2rem] p-12 text-center border-dashed border-white/10">
                  <WalletIcon className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                  <p className="text-slate-400">No accounts found.</p>
                </div>
              )}
            </div>
          </section>

          <section className="glass rounded-[2rem] overflow-hidden">
            <div className="p-8 border-b border-brand-border flex items-center justify-between bg-white/5">
              <h3 className="text-xl font-bold text-white">{isSystemUser ? 'Global Ledger' : 'Latest Transactions'}</h3>
              <button onClick={() => setActiveSection('transfers')} className="text-sm font-bold text-brand-primary hover:underline">Full History</button>
            </div>
            <TransactionList transactions={transactions.slice(0, 10)} />
          </section>
        </>
      )}

      {activeSection === 'accounts' && (
        <AccountsSection 
          accounts={accounts} 
          balances={balances} 
          onCreate={addAccount} 
          onRefresh={handleRefresh}
          refreshingId={refreshingId}
          onAddFunds={(id: string) => setSelectedAccountId(id)}
          isSystemUser={isSystemUser}
          isBusy={isBusy} 
        />
      )}

      {activeSection === 'transfers' && (
        <TransfersSection 
          accounts={accounts} 
          transactions={transactions}
          onTransfer={transferFunds} 
          isBusy={isBusy} 
          isSystemUser={isSystemUser}
          seedIdempotencyKey={seedIdempotencyKey} 
        />
      )}

      {activeSection === 'treasury' && isSystemUser && (
        <TreasurySection 
          onFund={fundInitialAccount} 
          isBusy={isBusy} 
          seedIdempotencyKey={seedIdempotencyKey} 
        />
      )}

      {activeSection === 'security' && (
        <div className="max-w-2xl mx-auto glass rounded-[2rem] p-10">
          <h2 className="text-2xl font-bold text-white mb-6">Security Center</h2>
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h4 className="font-bold text-white mb-2">Encryption Layer</h4>
              <p className="text-sm text-slate-400 leading-relaxed">All transaction data is processed through our immutable ledger system with high-entropy idempotency verification.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h4 className="font-bold text-white mb-2">Auth Verification</h4>
              <p className="text-sm text-slate-400 leading-relaxed">Active sessions are protected by JWT tokens with hardware-level cookie isolation.</p>
            </div>
          </div>
        </div>
      )}

      {selectedAccountId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-dark/80 backdrop-blur-sm animate-fade-in">
          <div className="glass w-full max-w-md rounded-[2.5rem] p-10 border border-white/10 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-2">Grant Initial Funds</h3>
            <p className="text-slate-400 text-sm mb-8 uppercase tracking-widest">Target: {selectedAccountId}</p>
            
            <form onSubmit={handleAddFunds} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-400 text-xs uppercase tracking-widest font-bold">Amount to Grant</Label>
                <div className="relative">
                  <Input 
                    type="number"
                    value={fundAmount}
                    onChange={e => setFundAmount(e.target.value)}
                    autoFocus
                    placeholder="0.00"
                    className="h-14 pl-10 bg-white/5 border-white/10 text-white"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setSelectedAccountId(null)} className="flex-1 text-slate-400 hover:text-white">
                  Cancel
                </Button>
                <Button type="submit" disabled={isBusy || !fundAmount} className="flex-[2] bg-brand-primary text-brand-dark font-bold h-12 rounded-xl">
                  {isBusy ? 'Processing...' : 'Grant Funds'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function AccountsSection({ accounts, balances, onCreate, onRefresh, refreshingId, onAddFunds, isSystemUser, isBusy }: any) {
  return (
    <div className="space-y-8 max-w-5xl mx-auto relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">{isSystemUser ? 'System Account Manager' : 'Accounts'}</h2>
          <p className="text-slate-400 mt-1">{isSystemUser ? 'Global view of all user financial assets' : 'Manage and monitor your financial assets'}</p>
        </div>
        {!isSystemUser && (
          <Button onClick={onCreate} disabled={isBusy} className="bg-brand-primary text-brand-dark font-bold rounded-xl px-6 h-12">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Account
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {accounts.map((account: any) => (
          <AccountCard 
            key={account._id} 
            account={account} 
            balance={balances[account._id] ?? 0}
            onRefresh={onRefresh}
            isRefreshing={refreshingId === account._id}
            onAddFunds={isSystemUser ? onAddFunds : undefined}
          />
        ))}
      </div>
    </div>
  )
}

function TransfersSection({ accounts, transactions, onTransfer, isBusy, isSystemUser, seedIdempotencyKey }: any) {
  const [fromAccount, setFromAccount] = useState(accounts[0]?._id ?? '')
  const [toAccount, setToAccount] = useState('')
  const [amount, setAmount] = useState('')
  const [idempotencyKey, setIdempotencyKey] = useState(seedIdempotencyKey())
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!fromAccount || !toAccount || !amount) {
      setError('Missing required fields')
      return
    }
    try {
      await onTransfer({ fromAccount, toAccount, amount: Number(amount), idempotencyKey })
      setAmount('')
      setIdempotencyKey(seedIdempotencyKey())
    } catch (err: any) {
      setError(err.message || 'Transfer failed')
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] max-w-6xl mx-auto">
      {!isSystemUser && (
        <div className="glass rounded-[2rem] p-10 h-fit">
          <h2 className="text-2xl font-bold text-white mb-8">Execute Transfer</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-400 text-xs uppercase tracking-widest font-bold">From Account</Label>
              <div className="grid grid-cols-1 gap-2">
                {accounts.slice(0, 5).map((acc: any) => (
                  <button
                    key={acc._id}
                    type="button"
                    onClick={() => setFromAccount(acc._id)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      fromAccount === acc._id ? 'border-brand-primary bg-brand-primary/10 text-white' : 'border-white/10 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <p className="text-xs font-mono opacity-50">{acc._id}</p>
                    <p className="font-bold text-white">{formatCurrency(acc.balance || 0)}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-400 text-xs uppercase tracking-widest font-bold">Recipient Account ID</Label>
              <Input 
                value={toAccount} 
                onChange={e => setToAccount(e.target.value)}
                className="h-14 rounded-2xl bg-white/5 border-white/10 focus:border-brand-primary text-white"
                placeholder="Enter destination account ID"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-400 text-xs uppercase tracking-widest font-bold">Amount</Label>
              <div className="relative">
                <Input 
                  type="number"
                  value={amount} 
                  onChange={e => setAmount(e.target.value)}
                  className="h-14 rounded-2xl bg-white/5 border-white/10 pl-10 focus:border-brand-primary text-white"
                  placeholder="0.00"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex gap-3">
                <AlertIcon className="h-5 w-5 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" disabled={isBusy} className="w-full h-14 rounded-2xl bg-brand-primary text-brand-dark font-bold text-lg">
              {isBusy ? 'Processing...' : 'Confirm Transfer'}
            </Button>
          </form>
        </div>
      )}

      <div className={`glass rounded-[2rem] overflow-hidden ${isSystemUser ? 'lg:col-span-2' : ''}`}>
        <div className="p-8 border-b border-brand-border bg-white/5">
          <h2 className="text-2xl font-bold text-white">{isSystemUser ? 'Full Transaction Ledger' : 'Transaction History'}</h2>
        </div>
        <TransactionList transactions={transactions} />
      </div>
    </div>
  )
}

function TreasurySection({ onFund, isBusy, seedIdempotencyKey }: any) {
  const [toAccount, setToAccount] = useState('')
  const [amount, setAmount] = useState('')
  const [idempotencyKey] = useState(seedIdempotencyKey())

  const handleSubmit = (e: any) => {
    e.preventDefault()
    onFund({ toAccount: Number(toAccount), amount: Number(amount), idempotencyKey })
  }

  return (
    <div className="max-w-2xl mx-auto glass rounded-[2rem] p-10">
      <h2 className="text-2xl font-bold text-white mb-8">System Treasury Fund</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label className="text-slate-400 text-xs uppercase tracking-widest font-bold">Target Account</Label>
          <Input 
            value={toAccount} 
            onChange={e => setToAccount(e.target.value)}
            className="h-14 rounded-2xl bg-white/5 border-white/10 text-white"
            placeholder="Account ID to receive funds"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-400 text-xs uppercase tracking-widest font-bold">Grant Amount</Label>
          <Input 
            type="number"
            value={amount} 
            onChange={e => setAmount(e.target.value)}
            className="h-14 rounded-2xl bg-white/5 border-white/10 text-white"
          />
        </div>
        <Button type="submit" disabled={isBusy} className="w-full h-14 rounded-2xl fintech-gradient text-white font-bold">
          Execute Funding
        </Button>
      </form>
    </div>
  )
}
