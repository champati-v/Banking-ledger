const AUTH_KEY = 'bank-ledger-auth'
const ACCOUNTS_KEY = 'bank-ledger-accounts'
const TRANSACTIONS_KEY = 'bank-ledger-transactions'

export interface PersistedAuth {
  token: string
  user: {
    _id: string
    name: string
    email: string
  }
}

export function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function saveJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function clearAuthStorage() {
  localStorage.removeItem(AUTH_KEY)
}

export function getAuthStorageKey() {
  return AUTH_KEY
}

export function getAccountsStorageKey() {
  return ACCOUNTS_KEY
}

export function getTransactionsStorageKey() {
  return TRANSACTIONS_KEY
}

