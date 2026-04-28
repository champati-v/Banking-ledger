import { cx } from '../../lib/cx'

type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'muted'

export function Badge({ className, variant = 'default', ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
    warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
    destructive: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
    muted: 'bg-slate-50 text-slate-500',
  }

  return <span className={cx('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]', variants[variant], className)} {...props} />
}

