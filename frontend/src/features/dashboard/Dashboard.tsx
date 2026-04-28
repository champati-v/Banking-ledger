import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Separator } from '../../components/ui/Separator'
import { AlertIcon, BankIcon, ClockIcon, LogoutIcon, PlusIcon, SearchIcon, ShieldIcon, TransferIcon, UserIcon, WalletIcon } from '../../components/icons'
import { useBanking } from '../../context/BankingContext'
import { formatCurrency, formatDateTime } from '../../lib/format'
import type { Account, Transaction } from '../../types'

type Section = 'overview' | 'accounts' | 'transfers' | 'treasury' | 'security'

type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'muted'

function statusTone(status?: string): BadgeVariant {
  switch (status) {
    case 'COMPLETED':
    case 'ACTIVE':
      return 'success'
    case 'PENDING':
      return 'warning'
    case 'FAILED':
    case 'REVERSED':
    case 'FROZEN':
      return 'destructive'
    default:
      return 'default'
  }
}

function SectionButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${
        active ? 'bg-slate-950 text-white shadow-lg shadow-slate-900/20' : 'bg-white text-slate-600 hover:bg-slate-100'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string
  value: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card className="border-slate-200/70 bg-white/90">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{value}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        </div>
        <div className="rounded-2xl bg-slate-950 p-3 text-white shadow-lg shadow-slate-900/15">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({
  title,
  description,
  icon: Icon,
}: {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center">
      <div className="mx-auto mb-4 inline-flex rounded-2xl bg-slate-950 p-3 text-white">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
    </div>
  )
}

export function Dashboard() {
  const {
    auth,
    accounts,
    transactions,
    balances,
    isBusy,
    isSystemUser,
    addAccount,
    fetchBalance,
    transferFunds,
    fundInitialAccount,
    signOut,
    seedIdempotencyKey,
  } = useBanking()

  const [section, setSection] = useState<Section>('overview')

  const totalBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + (balances[account._id] ?? 0), 0),
    [accounts, balances],
  )

  const latestTransaction = transactions[0]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_26%),linear-gradient(180deg,#f8fafc_0%,#eef4f9_100%)] text-slate-900">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-4 lg:px-8 lg:py-6">
        <header className="rounded-[28px] border border-white/70 bg-white/85 px-5 py-4 shadow-lg shadow-slate-900/5 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-slate-950 p-3 text-white">
                <BankIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Bank Ledger</p>
                <h1 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">Premium banking workspace</h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Signed in as</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{auth.user?.name}</p>
              </div>
              <Button variant="secondary" onClick={signOut} className="border-slate-200">
                <LogoutIcon className="h-4 w-4" />
                Log out
              </Button>
            </div>
          </div>
        </header>

        <nav className="flex flex-wrap gap-2">
          <SectionButton active={section === 'overview'} icon={UserIcon} label="Overview" onClick={() => setSection('overview')} />
          <SectionButton active={section === 'accounts'} icon={WalletIcon} label="Accounts" onClick={() => setSection('accounts')} />
          <SectionButton active={section === 'transfers'} icon={TransferIcon} label="Transfers" onClick={() => setSection('transfers')} />
          {isSystemUser && <SectionButton active={section === 'treasury'} icon={ShieldIcon} label="Treasury" onClick={() => setSection('treasury')} />}
          <SectionButton active={section === 'security'} icon={ShieldIcon} label="Security" onClick={() => setSection('security')} />
        </nav>

        {section === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
            <div className="space-y-6">
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Total balance" value={formatCurrency(totalBalance)} description="Local session balances across saved accounts." icon={WalletIcon} />
                <StatCard title="Accounts" value={`${accounts.length}`} description="Accounts created in this session." icon={BankIcon} />
                <StatCard title="Latest status" value={latestTransaction ? latestTransaction.status : 'No activity'} description="Most recent transaction state." icon={ClockIcon} />
                <StatCard title="Session mode" value={isBusy ? 'Processing' : 'Ready'} description="Transactions and balance checks are active." icon={ShieldIcon} />
              </section>

              <Card className="border-slate-200/70 bg-white/90">
                <CardHeader className="flex-col items-start gap-2">
                  <CardTitle>Welcome back, {auth.user?.name}</CardTitle>
                  <CardDescription>
                    Your dashboard is ready for account creation, balance lookup, and secure transfers.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <Button onClick={() => setSection('accounts')} className="justify-start">
                    <PlusIcon className="h-4 w-4" />
                    Create account
                  </Button>
                  <Button variant="secondary" onClick={() => setSection('transfers')} className="justify-start border-slate-200">
                    <TransferIcon className="h-4 w-4" />
                    Transfer funds
                  </Button>
                  <Button variant="secondary" onClick={() => setSection('security')} className="justify-start border-slate-200">
                    <ShieldIcon className="h-4 w-4" />
                    Security center
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200/70 bg-white/90">
                <CardHeader>
                  <div>
                    <CardTitle>Recent activity</CardTitle>
                    <CardDescription>Transactions created during this session.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {transactions.length === 0 ? (
                    <EmptyState
                      title="No transactions yet"
                      description="Transfers and funding operations will appear here once you submit them."
                      icon={TransferIcon}
                    />
                  ) : (
                    transactions.slice(0, 4).map((transaction) => (
                      <TransactionRow key={`${transaction.idempotencyKey}-${transaction.createdAt}`} transaction={transaction} />
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <AccountLookupCard accounts={accounts} balances={balances} fetchBalance={fetchBalance} />
              <Card className="border-slate-200/70 bg-white/90">
                <CardHeader className="flex-col items-start gap-2">
                  <CardTitle>Account profile</CardTitle>
                  <CardDescription>{auth.user?.email}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Current user</p>
                    <p className="mt-2 text-lg font-semibold">{auth.user?.name}</p>
                    <p className="mt-1 text-sm text-slate-300">{auth.user?.email}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <MiniInfo label="Auth" value="JWT cookie + bearer" />
                    <MiniInfo label="Ledger" value="Immutable records" />
                    <MiniInfo label="Retry safe" value="Idempotency keys" />
                    <MiniInfo label="Bank grade" value="Corporate UI" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {section === 'accounts' && (
          <AccountsSection
            accounts={accounts}
            balances={balances}
            onCreate={addAccount}
            onFetchBalance={fetchBalance}
            isBusy={isBusy}
          />
        )}

        {section === 'transfers' && (
          <TransfersSection
            accounts={accounts}
            onTransfer={transferFunds}
            isBusy={isBusy}
            seedIdempotencyKey={seedIdempotencyKey}
          />
        )}

        {section === 'treasury' && (
          <TreasurySection
            isSystemUser={isSystemUser}
            onFund={fundInitialAccount}
            isBusy={isBusy}
            seedIdempotencyKey={seedIdempotencyKey}
          />
        )}

        {section === 'security' && <SecuritySection signOut={signOut} />}
      </div>
    </div>
  )
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  )
}

function AccountLookupCard({
  accounts,
  balances,
  fetchBalance,
}: {
  accounts: Account[]
  balances: Record<string, number>
  fetchBalance: (accountId: string) => Promise<number>
}) {
  const [accountId, setAccountId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<number | null>(null)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const value = await fetchBalance(accountId.trim())
      setResult(value)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch balance.')
    } finally {
      setLoading(false)
    }
  }

  const currentValue = accountId.trim() ? balances[accountId.trim()] : null

  return (
    <Card className="border-slate-200/70 bg-white/90">
      <CardHeader className="flex-col items-start gap-2">
        <CardTitle>Balance lookup</CardTitle>
        <CardDescription>Check a specific account by ID.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-4" onSubmit={submit}>
          <div>
            <Label htmlFor="balance-account">Account ID</Label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <Input
                id="balance-account"
                className="pl-11"
                value={accountId}
                onChange={(event) => setAccountId(event.target.value)}
                placeholder="679f... or paste an account ID"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {accounts.slice(0, 3).map((account) => (
              <Button key={account._id} type="button" variant="secondary" size="sm" onClick={() => setAccountId(account._id)}>
                {account._id.slice(0, 10)}...
              </Button>
            ))}
          </div>
          <Button type="submit" className="w-full" disabled={loading || !accountId.trim()}>
            {loading ? 'Fetching...' : 'View balance'}
          </Button>
        </form>

        <div className="rounded-3xl bg-slate-950 px-5 py-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Balance result</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
            {result !== null ? formatCurrency(result) : currentValue !== null ? formatCurrency(currentValue) : '—'}
          </p>
          <p className="mt-2 text-sm text-slate-300">
            {accountId.trim() ? `Account ${accountId.trim()}` : 'Select or enter an account ID to reveal the balance.'}
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertIcon className="mt-0.5 h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AccountsSection({
  accounts,
  balances,
  onCreate,
  onFetchBalance,
  isBusy,
}: {
  accounts: Account[]
  balances: Record<string, number>
  onCreate: () => Promise<Account>
  onFetchBalance: (accountId: string) => Promise<number>
  isBusy: boolean
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <Card className="border-slate-200/70 bg-white/90">
        <CardHeader className="flex-col items-start gap-2">
          <CardTitle>Create account</CardTitle>
          <CardDescription>Open a new account tied to the authenticated profile.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Default currency: <span className="font-semibold text-slate-900">INR</span>
          </div>
          <Button className="w-full" onClick={onCreate} disabled={isBusy}>
            <PlusIcon className="h-4 w-4" />
            Create new account
          </Button>
        </CardContent>
      </Card>

      <Card className="border-slate-200/70 bg-white/90">
        <CardHeader className="flex-col items-start gap-2">
          <CardTitle>Your accounts</CardTitle>
          <CardDescription>Accounts created in this browser session.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {accounts.length === 0 ? (
            <EmptyState
              title="No accounts yet"
              description="Create the first account to unlock balance lookup and transfers."
              icon={WalletIcon}
            />
          ) : (
            accounts.map((account) => (
              <div key={account._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={statusTone(account.status)}>{account.status}</Badge>
                      <span className="text-sm font-medium text-slate-500">{account.currency}</span>
                    </div>
                    <p className="break-all text-sm font-semibold text-slate-900">{account._id}</p>
                    <p className="text-sm text-slate-500">Created {formatDateTime(account.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Balance</p>
                    <p className="mt-1 text-xl font-semibold text-slate-950">{formatCurrency(balances[account._id] ?? 0, account.currency)}</p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={async () => {
                      setLoadingId(account._id)
                      try {
                        await onFetchBalance(account._id)
                      } finally {
                        setLoadingId(null)
                      }
                    }}
                    disabled={loadingId === account._id}
                  >
                    <SearchIcon className="h-4 w-4" />
                    {loadingId === account._id ? 'Refreshing...' : 'Refresh balance'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function TransfersSection({
  accounts,
  onTransfer,
  isBusy,
  seedIdempotencyKey,
}: {
  accounts: Account[]
  onTransfer: (payload: { fromAccount: string; toAccount: string; amount: number; idempotencyKey?: string }) => Promise<Transaction>
  isBusy: boolean
  seedIdempotencyKey: () => string
}) {
  const { pushToast } = useBanking()
  const [fromAccount, setFromAccount] = useState(accounts[0]?._id ?? '')
  const [toAccount, setToAccount] = useState('')
  const [amount, setAmount] = useState('')
  const [idempotencyKey, setIdempotencyKey] = useState(seedIdempotencyKey())
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Transaction | null>(null)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setResult(null)

    if (!fromAccount || !toAccount || !amount.trim()) {
      setError('All fields are required.')
      return
    }

    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Enter a valid transfer amount.')
      return
    }

    try {
      const transaction = await onTransfer({
        fromAccount,
        toAccount,
        amount: numericAmount,
        idempotencyKey,
      })
      setResult(transaction)
      setIdempotencyKey(seedIdempotencyKey())
      setAmount('')
      pushToast({ title: 'Transfer complete', description: 'The transaction has been recorded.', tone: 'success' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed.')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <Card className="border-slate-200/70 bg-white/90">
        <CardHeader className="flex-col items-start gap-2">
          <CardTitle>Transfer funds</CardTitle>
          <CardDescription>Move money between accounts with a retry-safe idempotency key.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <div>
              <Label htmlFor="from-account">From account</Label>
              <Input id="from-account" value={fromAccount} onChange={(event) => setFromAccount(event.target.value)} placeholder="Sender account ID" />
              <div className="mt-2 flex flex-wrap gap-2">
                {accounts.slice(0, 3).map((account) => (
                  <Button key={account._id} type="button" variant="secondary" size="sm" onClick={() => setFromAccount(account._id)}>
                    {account._id.slice(0, 10)}...
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="to-account">To account</Label>
              <Input id="to-account" value={toAccount} onChange={(event) => setToAccount(event.target.value)} placeholder="Recipient account ID" />
            </div>

            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" />
            </div>

            <div>
              <Label htmlFor="idempotencyKey">Idempotency key</Label>
              <div className="flex gap-2">
                <Input id="idempotencyKey" value={idempotencyKey} onChange={(event) => setIdempotencyKey(event.target.value)} />
                <Button type="button" variant="secondary" onClick={() => setIdempotencyKey(seedIdempotencyKey())}>
                  Regenerate
                </Button>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">This key prevents duplicate transfer execution if the request is retried.</p>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <AlertIcon className="mt-0.5 h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isBusy}>
              <TransferIcon className="h-4 w-4" />
              {isBusy ? 'Processing transfer...' : 'Submit transfer'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-200/70 bg-white/90">
        <CardHeader className="flex-col items-start gap-2">
          <CardTitle>Transfer receipt</CardTitle>
          <CardDescription>Submission status and summary.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result ? (
            <div className="rounded-3xl bg-slate-950 px-5 py-6 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">Status</p>
                  <p className="mt-1 text-2xl font-semibold">{result.status}</p>
                </div>
                <Badge variant="success">{result.status}</Badge>
              </div>
              <Separator className="my-4 bg-white/10" />
              <div className="grid gap-4 sm:grid-cols-2">
                <ReceiptField label="Amount" value={formatCurrency(result.amount)} />
                <ReceiptField label="Idempotency" value={result.idempotencyKey} />
                <ReceiptField label="From" value={result.fromAccount} />
                <ReceiptField label="To" value={result.toAccount} />
              </div>
            </div>
          ) : (
            <EmptyState
              title="No transfer submitted"
              description="Use the form on the left to create a transaction receipt here."
              icon={TransferIcon}
            />
          )}

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <ClockIcon className="h-4 w-4" />
              Transfers may take a few seconds to complete.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TreasurySection({
  isSystemUser,
  onFund,
  isBusy,
  seedIdempotencyKey,
}: {
  isSystemUser: boolean
  onFund: (payload: { toAccount: string; amount: number; idempotencyKey?: string }) => Promise<Transaction>
  isBusy: boolean
  seedIdempotencyKey: () => string
}) {
  const [toAccount, setToAccount] = useState('')
  const [amount, setAmount] = useState('')
  const [idempotencyKey, setIdempotencyKey] = useState(seedIdempotencyKey())
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Transaction | null>(null)

  if (!isSystemUser) {
    return (
      <Card className="border-slate-200/70 bg-white/90">
        <CardContent className="p-8">
          <EmptyState
            title="Treasury tools hidden"
            description="This section appears only for recognized system-user sessions."
            icon={ShieldIcon}
          />
        </CardContent>
      </Card>
    )
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setResult(null)

    if (!toAccount || !amount.trim()) {
      setError('To account and amount are required.')
      return
    }

    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Enter a valid funding amount.')
      return
    }

    try {
      const transaction = await onFund({
        toAccount,
        amount: numericAmount,
        idempotencyKey,
      })
      setResult(transaction)
      setAmount('')
      setIdempotencyKey(seedIdempotencyKey())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Treasury funding failed.')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <Card className="border-slate-200/70 bg-white/90">
        <CardHeader className="flex-col items-start gap-2">
          <CardTitle>Initial funds</CardTitle>
          <CardDescription>Restricted treasury operation for system-user sessions only.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <div>
              <Label htmlFor="treasury-to">To account</Label>
              <Input id="treasury-to" value={toAccount} onChange={(event) => setToAccount(event.target.value)} placeholder="Destination account ID" />
            </div>
            <div>
              <Label htmlFor="treasury-amount">Amount</Label>
              <Input id="treasury-amount" type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} />
            </div>
            <div>
              <Label htmlFor="treasury-idempotency">Idempotency key</Label>
              <div className="flex gap-2">
                <Input id="treasury-idempotency" value={idempotencyKey} onChange={(event) => setIdempotencyKey(event.target.value)} />
                <Button type="button" variant="secondary" onClick={() => setIdempotencyKey(seedIdempotencyKey())}>
                  Regenerate
                </Button>
              </div>
            </div>
            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <AlertIcon className="mt-0.5 h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isBusy}>
              <ShieldIcon className="h-4 w-4" />
              {isBusy ? 'Processing treasury action...' : 'Send initial funding'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-200/70 bg-white/90">
        <CardHeader className="flex-col items-start gap-2">
          <CardTitle>Treasury receipt</CardTitle>
          <CardDescription>Only shown after a successful system-user transfer.</CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="rounded-3xl bg-slate-950 px-5 py-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">Completed</p>
              <p className="mt-2 text-3xl font-semibold">{formatCurrency(result.amount)}</p>
              <p className="mt-2 text-sm text-slate-300">Transferred to {result.toAccount}</p>
            </div>
          ) : (
            <EmptyState
              title="No treasury transfer yet"
              description="Submit the form to generate a receipt and transaction state."
              icon={ShieldIcon}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SecuritySection({ signOut }: { signOut: () => Promise<void> }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-slate-200/70 bg-white/90">
        <CardHeader className="flex-col items-start gap-2">
          <CardTitle>Session security</CardTitle>
          <CardDescription>Authentication and logout are handled with token blacklisting support.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-6 text-slate-600">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">Protected access</p>
            <p className="mt-1">The app sends credentials with cookie-aware requests and bearer fallback.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">Error handling</p>
            <p className="mt-1">Unauthorized sessions should return to the sign-in workspace cleanly.</p>
          </div>
          <Button onClick={signOut}>
            <LogoutIcon className="h-4 w-4" />
            End session now
          </Button>
        </CardContent>
      </Card>

      <Card className="border-slate-200/70 bg-white/90">
        <CardHeader className="flex-col items-start gap-2">
          <CardTitle>Design system</CardTitle>
          <CardDescription>Uniform premium styling throughout the interface.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <MiniInfo label="Palette" value="Navy, slate, white" />
          <MiniInfo label="Motion" value="Subtle, restrained" />
          <MiniInfo label="Icons" value="Single stroke set" />
          <MiniInfo label="Forms" value="Accessible and clear" />
        </CardContent>
      </Card>
    </div>
  )
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant={statusTone(transaction.status)}>{transaction.status}</Badge>
            <span className="text-sm text-slate-500">{formatDateTime(transaction.createdAt)}</span>
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-900">{formatCurrency(transaction.amount)}</p>
          <p className="mt-1 break-all text-sm text-slate-500">
            {transaction.fromAccount} → {transaction.toAccount}
          </p>
        </div>
        <div className="rounded-2xl bg-white px-4 py-3 text-xs font-medium text-slate-600">
          <p className="uppercase tracking-[0.24em] text-slate-400">Idempotency</p>
          <p className="mt-1 break-all text-slate-900">{transaction.idempotencyKey}</p>
        </div>
      </div>
    </div>
  )
}

function ReceiptField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300">{label}</p>
      <p className="mt-1 break-all text-sm text-white">{value}</p>
    </div>
  )
}
