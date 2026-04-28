/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { Account, ToastItem, Transaction, User } from '../types'
import { clearAuthStorage, getAuthStorageKey, loadJson, saveJson, type PersistedAuth } from '../lib/storage'
import { 
  createAccount, 
  createInitialFunds, 
  createTransaction, 
  loginUser, 
  logoutUser, 
  registerUser, 
  getBalance, 
  getAccounts, 
  getTransactions,
  getAllAccountsAdmin,
  getAllTransactionsAdmin
} from '../lib/api'
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
  refreshData: () => Promise<void>
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
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [balances, setBalances] = useState<Record<string, number>>({})
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const [activeView, setActiveView] = useState<AppView>(() => {
    const persistedAuth = loadJson<PersistedAuth | null>(getAuthStorageKey(), null)
    return persistedAuth ? 'dashboard' : 'landing'
  })
  const [isSystemUser, setIsSystemUser] = useState(false)

  const refreshData = useCallback(async (token?: string, user?: User | null) => {
    const activeToken = token || auth.token
    const activeUser = user || auth.user
    if (!activeToken || !activeUser) return
    
    try {
      console.log('Fetching banking data...')
      setIsSystemUser(activeUser.systemUser || false)

      let accountsRes, transactionsRes
      if (activeUser.systemUser) {
        console.log('System User detected, fetching admin data...')
        const [a, t] = await Promise.all([
          getAllAccountsAdmin(activeToken),
          getAllTransactionsAdmin(activeToken)
        ])
        accountsRes = a
        transactionsRes = t
      } else {
        const [a, t] = await Promise.all([
          getAccounts(activeToken),
          getTransactions(activeToken)
        ])
        accountsRes = a
        transactionsRes = t
      }
      
      console.log('Accounts received:', accountsRes.accounts.length)
      setAccounts(accountsRes.accounts)
      setTransactions(transactionsRes.transactions)
      
      const nextBalances: Record<string, number> = {}
      accountsRes.accounts.forEach((acc: any) => {
        nextBalances[acc._id] = acc.balance
      })
      setBalances(nextBalances)
    } catch (err) {
      console.error('Refresh data failed:', err)
      throw err
    }
  }, [auth.token, auth.user])

  // Initialization
  useEffect(() => {
    const init = async () => {
      console.log('Initializing Banking Provider...')
      if (auth.token && auth.user) {
        try {
          await refreshData(auth.token, auth.user)
        } catch (error) {
          console.error('Failed to hydrate banking data:', error)
          signOut()
        }
      }
      setIsHydrated(true)
    }
    init()
  }, []) // Only on mount

  useEffect(() => {
    if (auth.token && auth.user) {
      saveJson(getAuthStorageKey(), { token: auth.token, user: auth.user } satisfies PersistedAuth)
    } else {
      clearAuthStorage()
    }
  }, [auth])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (toasts.length > 0) {
        setToasts((current) => current.slice(0, current.length - 1))
      }
    }, 5000)
    return () => window.clearTimeout(timer)
  }, [toasts])

  const pushToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = makeIdempotencyKey()
    setToasts((current) => [{ id, ...toast }, ...current])
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

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    const response = await withBusy(() => loginUser({ email, password }))
    setAuth({ user: response.user, token: response.token })
    await refreshData(response.token, response.user)
    setActiveView('dashboard')
    pushToast({ title: 'Welcome back', description: 'Authentication successful.', tone: 'success' })
  }

  const signUp = async ({ name, email, password }: { name: string; email: string; password: string }) => {
    const response = await withBusy(() => registerUser({ name, email, password }))
    setAuth({ user: response.user, token: response.token })
    await refreshData(response.token, response.user)
    setActiveView('dashboard')
    pushToast({ title: 'Account created', description: 'Welcome to Bank Ledger.', tone: 'success' })
  }

  const signOut = async () => {
    if (auth.token) {
      try {
        await logoutUser(auth.token)
      } catch (e) { /* ignore */ }
    }
    setAuth({ user: null, token: null })
    setAccounts([])
    setTransactions([])
    setBalances({})
    setIsSystemUser(false)
    setActiveView('landing')
    clearAuthStorage()
    pushToast({ title: 'Signed out', description: 'Session ended securely.', tone: 'info' })
  }

  const addAccount = async () => {
    if (!auth.token) throw new Error('Auth required')
    const response = await withBusy(() => createAccount(auth.token))
    await refreshData()
    pushToast({ title: 'Account opened', description: 'Your new bank account is ready.', tone: 'success' })
    return response.account as Account
  }

  const fetchBalance = async (accountId: string) => {
    if (!auth.token) throw new Error('Auth required')
    const response = await withBusy(() => getBalance(accountId, auth.token))
    setBalances((prev) => ({ ...prev, [accountId]: response.balance }))
    return response.balance
  }

  const transferFunds = async (payload: { fromAccount: string; toAccount: string; amount: number; idempotencyKey?: string }) => {
    if (!auth.token) throw new Error('Auth required')
    const body = {
      ...payload,
      idempotencyKey: payload.idempotencyKey || makeIdempotencyKey(),
    }
    const response = await withBusy(() => createTransaction(body, auth.token))
    await refreshData()
    pushToast({ title: 'Transfer complete', description: 'Funds have been moved successfully.', tone: 'success' })
    return response.transaction as Transaction
  }

  const fundInitialAccount = async (payload: { toAccount: string; amount: number; idempotencyKey?: string }) => {
    if (!auth.token) throw new Error('Auth required')
    const body = {
      ...payload,
      idempotencyKey: payload.idempotencyKey || makeIdempotencyKey(),
    }
    const response = await withBusy(() => createInitialFunds(body, auth.token))
    await refreshData()
    pushToast({ title: 'Funding complete', description: 'Treasury funds allocated.', tone: 'success' })
    return response.transaction as Transaction
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
    refreshData,
    transferFunds,
    fundInitialAccount,
    seedIdempotencyKey,
  }

  return <BankingContext.Provider value={value}>{children}</BankingContext.Provider>
}

export function useBanking() {
  const context = useContext(BankingContext)
  if (!context) throw new Error('useBanking must be used inside BankingProvider')
  return context
}
