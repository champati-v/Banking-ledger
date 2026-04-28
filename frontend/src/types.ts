export type AccountStatus = 'ACTIVE' | 'FROZEN' | 'CLOSED'
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED'
export type ToastTone = 'success' | 'error' | 'info'

export interface User {
  _id: string
  name: string
  email: string
  systemUser?: boolean
}

export interface Account {
  _id: string
  user?: string
  status: AccountStatus
  currency: string
  createdAt?: string
  updatedAt?: string
}

export interface Transaction {
  _id?: string
  fromAccount: string
  toAccount: string
  amount: number
  idempotencyKey: string
  status: TransactionStatus
  createdAt?: string
  updatedAt?: string
}

export interface ToastItem {
  id: string
  title: string
  description?: string
  tone: ToastTone
}

