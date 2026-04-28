/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import type { Account, ToastItem, Transaction, User } from '../types'
import { clearAuthStorage, getAccountsStorageKey, getAuthStorageKey, getTransactionsStorageKey, loadJson, saveJson, type PersistedAuth } from '../lib/storage'
import { createAccount, createInitialFunds, createTransaction, loginUser, logoutUser, registerUser, getBalance } from '../lib/api'
import { makeIdempotencyKey } from '../lib/format'

type AppView = 'landing' | 'dashboard'

interface AuthState {
  user: User | null
  token: string | null
}

interface BankingContextValue {
  auth: AuthState
  accounts: Account[]
  transactions: Transaction[]
  balances: Record<string, number>
  isHydrated: boolean
  isBusy: boolean
  activeView: AppView
  toasts: ToastItem[]
  isSystemUser: boolean
  setActiveView: (view: AppView) => void
  pushToast: (toast: Omit<ToastItem, 'id'>) => void
  dismissToast: (id: string) => void
  signIn: (payload: { email: string; password: string }) => Promise<void>
  signUp: (payload: { name: string; email: string; password: string }) => Promise<void>
  signOut: () => Promise<void>
  addAccount: () => Promise<Account>
  fetchBalance: (accountId: string) => Promise<number>
  transferFunds: (payload: { fromAccount: string; toAccount: string; amount: number; idempotencyKey?: string }) => Promise<Transaction>
  fundInitialAccount: (payload: { toAccount: string; amount: number; idempotencyKey?: string }) => Promise<Transaction>
  seedIdempotencyKey: () => string
}

const BankingContext = createContext<BankingContextValue | null>(null)

export function BankingProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    const persistedAuth = loadJson<PersistedAuth | null>(getAuthStorageKey(), null)
    return persistedAuth ? { user: persistedAuth.user, token: persistedAuth.token } : { user: null, token: null }
  })
  const [accounts, setAccounts] = useState<Account[]>(() => loadJson<Account[]>(getAccountsStorageKey(), []))
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadJson<Transaction[]>(getTransactionsStorageKey(), []))
  const [balances, setBalances] = useState<Record<string, number>>({})
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const isHydrated = true
  const [isBusy, setIsBusy] = useState(false)
  const [activeView, setActiveView] = useState<AppView>(() => {
    const persistedAuth = loadJson<PersistedAuth | null>(getAuthStorageKey(), null)
    return persistedAuth ? 'dashboard' : 'landing'
  })
  const [isSystemUser, setIsSystemUser] = useState(false)

  useEffect(() => {
    if (!isHydrated) return
    if (auth.token && auth.user) {
      saveJson(getAuthStorageKey(), { token: auth.token, user: auth.user } satisfies PersistedAuth)
    } else {
      clearAuthStorage()
    }
  }, [auth, isHydrated])

  useEffect(() => {
    if (!isHydrated) return
    saveJson(getAccountsStorageKey(), accounts)
  }, [accounts, isHydrated])

  useEffect(() => {
    if (!isHydrated) return
    saveJson(getTransactionsStorageKey(), transactions)
  }, [transactions, isHydrated])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setToasts((current) => current.slice(0, 4))
    }, 4500)

    return () => window.clearTimeout(timer)
  }, [toasts])

  const pushToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = makeIdempotencyKey()
    setToasts((current) => [{ id, ...toast }, ...current].slice(0, 4))
  }

  const dismissToast = (id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id))
  }

  const withBusy = async <T,>(operation: () => Promise<T>) => {
    setIsBusy(true)
    try {
      return await operation()
    } finally {
      setIsBusy(false)
    }
  }

  const hydrateAuth = (user: User, token: string) => {
    setAuth({ user, token })
    setActiveView('dashboard')
  }

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    const response = await withBusy(() => loginUser({ email, password }))
    hydrateAuth(response.user, response.token)
    pushToast({ title: 'Signed in', description: 'Your banking workspace is ready.', tone: 'success' })
  }

  const signUp = async ({ name, email, password }: { name: string; email: string; password: string }) => {
    const response = await withBusy(() => registerUser({ name, email, password }))
    hydrateAuth(response.user, response.token)
    pushToast({ title: 'Account created', description: 'Welcome to Bank Ledger.', tone: 'success' })
  }

  const signOut = async () => {
    await withBusy(async () => {
      try {
        await logoutUser(auth.token)
      } catch {
        // Even if the network call fails, clear the local session.
      }
    })

    setAuth({ user: null, token: null })
    setAccounts([])
    setTransactions([])
    setBalances({})
    setIsSystemUser(false)
    setActiveView('landing')
    clearAuthStorage()
    pushToast({ title: 'Signed out', description: 'Session cleared from this device.', tone: 'info' })
  }

  const addAccount = async () => {
    if (!auth.token) throw new Error('You must be signed in to create an account.')

    const response = await withBusy(() => createAccount(auth.token))
    const account = response.account as Account
    const nextAccount = {
      ...account,
      status: account.status || 'ACTIVE',
      currency: account.currency || 'INR',
    }

    setAccounts((current) => [nextAccount, ...current])
    setBalances((current) => ({ ...current, [nextAccount._id]: current[nextAccount._id] ?? 0 }))
    pushToast({ title: 'Account created', description: `Account ${nextAccount._id} is now active.`, tone: 'success' })
    return nextAccount
  }

  const fetchBalance = async (accountId: string) => {
    if (!auth.token) throw new Error('You must be signed in to check balances.')

    const response = await withBusy(() => getBalance(accountId, auth.token))
    setBalances((current) => ({ ...current, [accountId]: response.balance }))
    pushToast({ title: 'Balance refreshed', description: `Fetched the latest balance for ${accountId}.`, tone: 'info' })
    return response.balance
  }

  const transferFunds = async (payload: { fromAccount: string; toAccount: string; amount: number; idempotencyKey?: string }) => {
    if (!auth.token) throw new Error('You must be signed in to transfer funds.')

    const body = {
      ...payload,
      idempotencyKey: payload.idempotencyKey || makeIdempotencyKey(),
    }

    const response = await withBusy(() => createTransaction(body, auth.token))
    const transaction: Transaction = {
      ...(response.transaction as Transaction),
      ...body,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    }

    setTransactions((current) => [transaction, ...current])
    pushToast({ title: 'Transfer submitted', description: 'The transaction completed successfully.', tone: 'success' })
    return transaction
  }

  const fundInitialAccount = async (payload: { toAccount: string; amount: number; idempotencyKey?: string }) => {
    if (!auth.token) throw new Error('You must be signed in to use treasury tools.')

    const body = {
      ...payload,
      idempotencyKey: payload.idempotencyKey || makeIdempotencyKey(),
    }

    const response = await withBusy(() => createInitialFunds(body, auth.token))
    const transaction: Transaction = {
      ...(response.transaction as Transaction),
      fromAccount: auth.user?._id || 'system',
      toAccount: body.toAccount,
      amount: body.amount,
      idempotencyKey: body.idempotencyKey,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    }

    setTransactions((current) => [transaction, ...current])
    setIsSystemUser(true)
    pushToast({ title: 'Treasury transfer complete', description: 'Initial funding was processed.', tone: 'success' })
    return transaction
  }

  const seedIdempotencyKey = () => makeIdempotencyKey()

  const value: BankingContextValue = {
    auth,
    accounts,
    transactions,
    balances,
    isHydrated,
    isBusy,
    activeView,
    toasts,
    isSystemUser,
    setActiveView,
    pushToast,
    dismissToast,
    signIn,
    signUp,
    signOut,
    addAccount,
    fetchBalance,
    transferFunds,
    fundInitialAccount,
    seedIdempotencyKey,
  }

  return <BankingContext.Provider value={value}>{children}</BankingContext.Provider>
}

export function useBanking() {
  const context = useContext(BankingContext)
  if (!context) {
    throw new Error('useBanking must be used inside BankingProvider')
  }
  return context
}
