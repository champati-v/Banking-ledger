import { AuthPanel } from '../auth/AuthPanel'
import { Badge } from '../../components/ui/Badge'
import { Card, CardContent } from '../../components/ui/Card'
import { BankIcon, CheckIcon, ShieldIcon, TransferIcon, WalletIcon } from '../../components/icons'

export function LandingPage() {
  const features = [
    { icon: ShieldIcon, title: 'Protected sessions', text: 'JWT auth, cookie support, and session blacklisting.' },
    { icon: WalletIcon, title: 'Account control', text: 'Create accounts and inspect balances instantly.' },
    { icon: TransferIcon, title: 'Safe transfers', text: 'Idempotency-backed transfers designed for retries.' },
    { icon: BankIcon, title: 'Corporate grade', text: 'A sober, premium interface that feels like real banking.' },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(23,50,77,0.1),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef4f9_100%)] text-slate-900">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:64px_64px] opacity-35" />
      <main className="relative mx-auto grid min-h-screen max-w-7xl gap-10 px-4 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-10">
        <section className="flex flex-col justify-center gap-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600 shadow-sm backdrop-blur">
            <Badge variant="success" className="px-2 py-0.5 text-[10px] tracking-[0.22em]">
              Secure
            </Badge>
            Bank Ledger
          </div>

          <div className="max-w-2xl space-y-5">
            <h1 className="text-5xl font-semibold tracking-[-0.04em] text-slate-950 lg:text-7xl">
              Premium digital banking for modern finance teams.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-slate-600">
              Manage accounts, check balances, and move money through a refined corporate banking interface built around security, clarity, and speed.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['Immutable ledger', 'Audit-friendly account history'],
              ['Instant balance view', 'Fetch balances by account ID'],
              ['Reliable retries', 'Idempotent transaction submissions'],
            ].map(([title, text]) => (
              <Card key={title} className="border-slate-200/70 bg-white/80">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-2xl bg-slate-900 p-2 text-white">
                      <CheckIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="border-slate-200/70 bg-white/80">
                  <CardContent className="space-y-3 p-5">
                    <div className="inline-flex rounded-2xl bg-slate-900 p-3 text-white shadow-lg shadow-slate-900/15">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{feature.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{feature.text}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-xl">
            <div className="mb-4 flex items-center justify-between rounded-3xl border border-white/70 bg-white/85 px-5 py-4 shadow-lg shadow-slate-900/5 backdrop-blur">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Corporate banking</p>
                <p className="mt-1 text-sm text-slate-700">Secure onboarding and treasury operations</p>
              </div>
              <div className="rounded-2xl bg-slate-950 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white">
                Live
              </div>
            </div>
            <AuthPanel />
          </div>
        </section>
      </main>
    </div>
  )
}

