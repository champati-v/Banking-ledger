import { cx } from '../../lib/cx'

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cx('mb-2 block text-sm font-medium text-slate-700', className)} {...props} />
}

