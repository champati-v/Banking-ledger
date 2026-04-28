import { cx } from '../../lib/cx'

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cx(
        'h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-brand-primary/50 focus:bg-white/10 focus:ring-4 focus:ring-brand-primary/10',
        className,
      )}
      {...props}
    />
  )
}

