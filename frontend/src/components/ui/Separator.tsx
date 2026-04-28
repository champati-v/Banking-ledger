import { cx } from '../../lib/cx'

export function Separator({ className }: { className?: string }) {
  return <div className={cx('h-px w-full bg-slate-200', className)} />
}

