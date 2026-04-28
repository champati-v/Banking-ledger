const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://banking-ledger-jbsm.onrender.com/api'

type RequestOptions = RequestInit & {
  token?: string | null
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers || {})
  headers.set('Content-Type', 'application/json')

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`)
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  const contentType = response.headers.get('content-type') || ''
  const body = contentType.includes('application/json')
    ? await response.json()
    : { message: await response.text() }

  if (!response.ok) {
    const error = new Error(body?.message || 'Request failed') as Error & { status?: number; payload?: unknown }
    error.status = response.status
    error.payload = body
    throw error
  }

  return body as T
}

export interface AuthResponse {
  user: {
    _id: string
    name: string
    email: string
  }
  token: string
}

export function registerUser(body: { name: string; email: string; password: string }) {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function loginUser(body: { email: string; password: string }) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function logoutUser(token: string | null) {
  return request<{ message: string; status: string }>('/auth/logout', {
    method: 'POST',
    token,
  })
}

export function createAccount(token: string | null) {
  return request<{ message: string; status: string; account: unknown }>('/accounts', {
    method: 'POST',
    token,
  })
}

export function getBalance(accountId: string, token: string | null) {
  return request<{ message: string; status: string; balance: number }>(`/accounts/balance/${accountId}`, {
    method: 'GET',
    token,
  })
}

export function createTransaction(
  body: { fromAccount: string; toAccount: string; amount: number; idempotencyKey: string },
  token: string | null,
) {
  return request<{ message: string; status: string; transaction: unknown }>('/transactions', {
    method: 'POST',
    body: JSON.stringify(body),
    token,
  })
}

export function createInitialFunds(
  body: { toAccount: string; amount: number; idempotencyKey: string },
  token: string | null,
) {
  return request<{ message: string; status: string; transaction: unknown }>('/transactions/system/initial-funds', {
    method: 'POST',
    body: JSON.stringify(body),
    token,
  })
}
export function getAccounts(token: string | null) {
  return request<{ message: string; status: string; accounts: any[] }>('/accounts', {
    method: 'GET',
    token,
  })
}

export function getAllAccountsAdmin(token: string | null) {
  return request<{ message: string; status: string; accounts: any[] }>('/accounts/admin/all', {
    method: 'GET',
    token,
  })
}

export function getTransactions(token: string | null) {
  return request<{ message: string; status: string; transactions: any[] }>('/transactions', {
    method: 'GET',
    token,
  })
}

export function getAllTransactionsAdmin(token: string | null) {
  return request<{ message: string; status: string; transactions: any[] }>('/transactions/admin/all', {
    method: 'GET',
    token,
  })
}
