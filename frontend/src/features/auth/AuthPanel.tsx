import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { useBanking } from '../../context/BankingContext'
import { AlertIcon, CheckIcon, ShieldIcon } from '../../components/icons'

type Mode = 'signin' | 'signup'

export function AuthPanel() {
  const { signIn, signUp, isBusy } = useBanking()
  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (mode === 'signup' && !name.trim()) {
      setError('Name is required.')
      return
    }

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.')
      return
    }

    try {
      if (mode === 'signin') {
        await signIn({ email, password })
      } else {
        await signUp({ name, email, password })
      }
      setSuccess(mode === 'signin' ? 'Signed in successfully.' : 'Account created successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.')
    }
  }

  return (
    <Card className="border-white/60 bg-white/95">
      <CardHeader className="flex-col items-start gap-2">
        <div className="flex items-center gap-2 text-slate-900">
          <ShieldIcon className="h-5 w-5 text-slate-700" />
          <CardTitle>{mode === 'signin' ? 'Secure Sign In' : 'Open Your Banking Profile'}</CardTitle>
        </div>
        <CardDescription>
          {mode === 'signin'
            ? 'Access your dashboard, balances, and transfers with protected sessions.'
            : 'Create a premium banking profile with secure session handling.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
          <Button variant={mode === 'signin' ? 'primary' : 'ghost'} className="rounded-xl" onClick={() => setMode('signin')}>
            Sign In
          </Button>
          <Button variant={mode === 'signup' ? 'primary' : 'ghost'} className="rounded-xl" onClick={() => setMode('signup')}>
            Create Account
          </Button>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          {mode === 'signup' && (
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Aarav Mehta" />
            </div>
          )}

          <div>
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-emerald-600" />
              Cookie + token session support
            </div>
            <span className="font-medium text-slate-900">3 day session window</span>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertIcon className="mt-0.5 h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckIcon className="mt-0.5 h-4 w-4" />
              <span>{success}</span>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={isBusy}>
            {isBusy ? 'Processing...' : mode === 'signin' ? 'Enter Dashboard' : 'Create Secure Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

